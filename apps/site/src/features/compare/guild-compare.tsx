/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { BOX_GAP, Box, HEADING_BOX } from "~/components/ui/box";
import { CompareSection, type Pair, type Sides } from "~/features/compare/compare-page";
import { GameIcon, hasGameIcon } from "~/components/ui/game-icon";
import { Link } from "@tanstack/react-router";
import { MinecraftText } from "~/components/ui/minecraft-text";
import { PageBackground } from "~/components/ui/background";
import { cn } from "~/lib/util";
import { dateFormat } from "~/features/guild/guild-page";
import { useNumberFormat } from "~/i18n/use-number-format";
import { useTranslation } from "react-i18next";
import type { GuildPage, StatCell as Stat } from "@statsify/contract";
import type { ReactNode } from "react";

const MAX_MEMBERS = 125;

type Cell = Omit<Stat, "leaderboard">;

/** A stat cell of both guilds, with what differs between them. */
const pair = (base: Cell, a: Partial<Cell>, b: Partial<Cell>): Pair => ({
  a: { leaderboard: null, ...base, ...a },
  b: { leaderboard: null, ...base, ...b },
});

/** The guild page's summary and its GEXP by period for two guilds, paired as the player comparison pairs a game's. */
export function guildPairs(a: GuildPage, b: GuildPage, formatDate: (time: number) => string): { title?: string; pairs: Pair[] }[] {
  const gexp = (key: string, label: string, value: (guild: GuildPage) => number) =>
    pair({ key, label, colour: "§2", value: 0 }, { value: value(a) }, { value: value(b) });

  return [
    {
      pairs: [
        pair({ key: "level", label: "stats.guild.level", colour: "§f", value: 0 }, { value: a.level, colour: a.tagColor }, { value: b.level, colour: b.tagColor }),
        pair({ key: "members", label: "stats.guild.members", colour: "§9", value: 0, of: MAX_MEMBERS }, { value: a.memberCount }, { value: b.memberCount }),
        gexp("exp", "stats.guild.gexp", (guild) => guild.exp),
        pair({ key: "createdAt", label: "stats.guild.createdOn", colour: "§3", value: 0 }, { value: formatDate(a.createdAt) }, { value: formatDate(b.createdAt) }),
        ...(a.master && b.master ? [pair({ key: "master", label: "stats.guild.guildMaster", colour: "§b", value: 0 }, { value: a.master }, { value: b.master })] : []),
      ],
    },
    {
      title: "guild.exp",
      pairs: [
        gexp("daily", "stats.guild.daily", (guild) => guild.daily),
        gexp("weekly", "stats.guild.weekly", (guild) => guild.weekly),
        gexp("monthly", "stats.guild.monthly", (guild) => guild.monthly),
      ],
    },
    {
      title: "default:stats.guild.scaledGexp",
      pairs: [
        gexp("scaledDaily", "stats.guild.daily", (guild) => guild.scaledDaily),
        gexp("scaledWeekly", "stats.guild.weekly", (guild) => guild.scaledWeekly),
        gexp("scaledMonthly", "stats.guild.monthly", (guild) => guild.scaledMonthly),
      ],
    },
  ];
}

type TableRow = { key: string; label: ReactNode; values: [number, number] };

const gameExp = (guild: GuildPage, id: string) => guild.expByGame.find((game) => game.id === id)?.exp ?? 0;

/** The days both guilds' histories have, newest first. */
function historyRows(a: GuildPage, b: GuildPage, formatDate: (time: number) => string): TableRow[] {
  const days = new Map(b.history.map(({ day, exp }) => [day, exp]));
  return a.history.flatMap(({ day, exp }) => {
    const other = days.get(day);
    return other === undefined ? [] : [{ key: day, label: formatDate(Date.parse(day)), values: [exp, other] }];
  });
}

/** Every game either guild has GEXP in, most first by the two together; a game one has none in counts as 0. */
function gameRows(a: GuildPage, b: GuildPage): TableRow[] {
  const games = new Map([...a.expByGame, ...b.expByGame].map(({ id, name }) => [id, name]));

  return [...games]
    .map(([id, name]): TableRow => ({
      key: id,
      label: (
        <span className="flex items-center gap-2">
          {hasGameIcon(id) && <span aria-hidden className="shrink-0"><GameIcon game={id} /></span>}
          <span className="min-w-0 wrap-anywhere">{name}</span>
        </span>
      ),
      values: [gameExp(a, id), gameExp(b, id)],
    }))
    .toSorted((x, y) => y.values[0] + y.values[1] - (x.values[0] + x.values[1]));
}

/** Two guilds side by side: a row each of the summary and GEXP boxes, then the GEXP by day and by game as tables. */
export function GuildCompareView({ a, b }: { a: GuildPage; b: GuildPage }) {
  const { t, i18n } = useTranslation();
  const date = dateFormat(i18n.language);
  const formatDate = (time: number) => date.format(time);
  const sides: Sides = [<GuildRowName key="a" guild={a} />, <GuildRowName key="b" guild={b} />];
  const history = historyRows(a, b, formatDate);
  const byGame = gameRows(a, b);

  return (
    <div className="relative grow">
      <PageBackground background="guilds" />
      <div className="w-container flex flex-col gap-4 px-4 py-6 text-mc-white md:px-8">
        <div className={cn("grid grid-cols-2", BOX_GAP)}>
          <GuildNametag guild={a} />
          <GuildNametag guild={b} end />
          <Box as="h1" className={cn(HEADING_BOX, "content:text-mc-2")}>
            <span className="sr-only">{t("compare.versus", { a: a.name, b: b.name })} · </span>
            {t("compare.guildHeading")}
          </Box>
        </div>
        {guildPairs(a, b, formatDate).map(({ title, pairs }) => (
          <CompareSection key={title ?? "summary"} title={title && t(title)} pairs={pairs} sides={sides} />
        ))}
        <div className={cn("grid grid-cols-1 lg:grid-cols-2 lg:[&>:only-child]:col-span-2", BOX_GAP)}>
          {history.length > 0 && <CompareTable title={t("guild.history")} heading={t("default:stats.guild.date")} guilds={[a, b]} rows={history} />}
          {byGame.length > 0 && <CompareTable title={t("guild.byGame")} heading={t("default:stats.game")} guilds={[a, b]} rows={byGame} />}
        </div>
      </div>
    </div>
  );
}

/** A guild's name with its tag, linking to its page. */
function GuildNametag({ guild, end = false }: { guild: GuildPage; end?: boolean }) {
  return (
    <Box className={cn("content:flex content:items-center", end && "content:justify-end content:text-end")}>
      <Link to="/{-$locale}/guild/$name" params={{ name: guild.name }} className="min-w-0 wrap-anywhere text-mc-1.5 hover:underline">
        <MinecraftText>{guild.nameFormatted}</MinecraftText>
      </Link>
    </Box>
  );
}

function GuildRowName({ guild }: { guild: GuildPage }) {
  return <h3 className="min-w-0 wrap-anywhere text-mc-1.5"><MinecraftText>{guild.nameFormatted}</MinecraftText></h3>;
}

/** Both guilds' GEXP by row, a column each, the higher in bright green so a scan down a column finds who led. */
function CompareTable({ title, heading, guilds, rows }: { title: string; heading: string; guilds: [GuildPage, GuildPage]; rows: TableRow[] }) {
  const n = useNumberFormat();

  return (
    <Box title={<h2 className="text-mc-1.5 text-mc-gray">{title}</h2>}>
      <table className="w-full table-fixed text-mc-1.5">
        <caption className="sr-only">{title}</caption>
        <thead>
          <tr className="text-mc-gray">
            <th scope="col" className="w-2/5 px-2 pb-2 text-start font-normal"><span className="mc-crisp">{heading}</span></th>
            {guilds.map((guild, index) => (
              <th key={index} scope="col" className="px-2 pb-2 text-end font-normal wrap-anywhere">
                <MinecraftText className="mc-crisp">{guild.nameFormatted}</MinecraftText>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(({ key, label, values }) => (
            <tr key={key} className="border-t-2 border-black/20 [&>*]:mc-crisp">
              <th scope="row" className="px-2 py-1 text-start font-normal">{label}</th>
              {values.map((value, index) => (
                <td key={index} className={cn("px-2 py-1 text-end", value > values[1 - index] ? "text-mc-green" : "text-mc-dark-green")}>
                  {n(value)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Box>
  );
}
