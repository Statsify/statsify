/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { BOX_GAP, Box, HEADING_BOX } from "~/components/ui/box";
import { GameIcon, hasGameIcon } from "~/components/ui/game-icon";
import { Hint } from "~/components/ui/hint";
import { Link } from "@tanstack/react-router";
import { MinecraftText } from "~/components/ui/minecraft-text";
import { PAGE_STALE_MS } from "~/lib/player-route";
import { PageBackground } from "~/components/ui/background";
import { SkinHead } from "~/components/ui/skin";
import { TableData } from "~/components/ui/table";
import { UpdatedAt, useNow } from "~/features/player/refresh-bar";
import { cn } from "~/lib/util";
import { guildXpBar } from "~/components/ui/progression";
import { orpc } from "~/lib/orpc";
import { useNumberFormat } from "~/i18n/use-number-format";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { GuildMemberRow, GuildPage } from "@statsify/contract";

export const guildPageQuery = (name: string) => orpc.guild.page.queryOptions({ input: { name }, staleTime: PAGE_STALE_MS });

/** Hypixel's dates in UTC, so the server and the browser print the same day whatever the visitor's zone. */
const dateFormat = (locale: string) => new Intl.DateTimeFormat(locale, { timeZone: "UTC", year: "numeric", month: "short", day: "numeric" });

/** The guild's header, its level and GEXP, the GEXP by day and by game, then every member in a table that sorts. */
export function GuildView({ guild }: { guild: GuildPage }) {
  const { t, i18n } = useTranslation();
  const n = useNumberFormat();
  const date = dateFormat(i18n.language);
  const colour = guild.tagColor;
  const level = Math.floor(guild.level);

  return (
    <div className="relative grow">
      <PageBackground background="guilds" viewport mask="linear-gradient(rgb(255 255 255) 30%, rgb(0 0 0 / 0) 95%)" />
      <div className="w-container flex flex-col gap-4 px-4 py-6 text-mc-white md:px-8">
        <div className={cn("grid grid-cols-1 lg:grid-cols-2", BOX_GAP)}>
          <Box as="h1" className={cn(HEADING_BOX, "content:text-mc-3 md:content:text-mc-4")}>
            <span className="min-w-0 wrap-anywhere text-center"><MinecraftText>{guild.nameFormatted}</MinecraftText></span>
          </Box>
          <Box title={<h2 className="text-mc-1.5 text-mc-gray">{t("guild.info")}</h2>} className="content:leading-[24px]">
            {guild.master && (
              <p className="text-mc-aqua">
                {t("default:stats.guild.guildMaster")}: <MinecraftText>{guild.master}</MinecraftText>
              </p>
            )}
            <p className="text-mc-dark-aqua">
              {t("default:stats.guild.createdOn")}: <span className="text-mc-gray">{date.format(guild.createdAt)}</span>
            </p>
            <p className="text-mc-blue">
              {t("default:stats.guild.members")}: <span className="text-mc-white">{t("guild.memberCount", { count: guild.memberCount })}</span>
            </p>
            <p className="text-mc-dark-green">
              {t("default:stats.guild.gexp")}: <span className="text-mc-white">{n(guild.exp)}</span>
            </p>
          </Box>
          <Box className="content:flex content:flex-col content:items-center content:justify-center content:text-center content:leading-[24px]">
            <p>{t("default:stats.guild.level")}: <MinecraftText>{`${colour}${n(guild.level)}`}</MinecraftText></p>
            <p>
              {t("default:stats.progression.gexp")}: <span className="text-mc-aqua">{n(guild.progression.current)}</span>/
              <span className="text-mc-green">{n(guild.progression.max!)}</span>
            </p>
            <p aria-hidden><MinecraftText>{`${colour}${n(level)} ${guildXpBar(colour)(guild.progression.percent)} ${colour}${n(level + 1)}`}</MinecraftText></p>
          </Box>
          {guild.description && (
            <Box title={<h2 className="text-mc-1.5 text-mc-gray">{t("guild.description")}</h2>} className="lg:col-span-2 content:break-words">
              {guild.description}
            </Box>
          )}
          {guild.preferredGames.some(({ id }) => hasGameIcon(id)) && (
            <Box title={<h2 className="text-mc-1.5 text-mc-gray">{t("guild.preferredGames")}</h2>} className="lg:col-span-2">
              <div className="flex flex-wrap items-center justify-center gap-2">
                {guild.preferredGames.map(({ id, name }) => hasGameIcon(id) && <Hint key={id} full={name}><GameIcon game={id} /></Hint>)}
              </div>
            </Box>
          )}
        </div>
        {[
          { id: "guild-exp", title: t("guild.exp"), daily: guild.daily, weekly: guild.weekly, monthly: guild.monthly },
          { id: "guild-scaled-exp", title: t("default:stats.guild.scaledGexp"), daily: guild.scaledDaily, weekly: guild.scaledWeekly, monthly: guild.scaledMonthly },
        ].map(({ id, title, daily, weekly, monthly }) => (
          <section key={id} aria-labelledby={id} className={cn("grid grid-cols-3", BOX_GAP)}>
            <Box className={cn(HEADING_BOX, "content:text-mc-gray")}>
              <h2 id={id} className="text-mc-1.5">{title}</h2>
            </Box>
            <TableData title={t("default:stats.guild.daily")} value={n(daily)} color="text-mc-dark-green" />
            <TableData title={t("default:stats.guild.weekly")} value={n(weekly)} color="text-mc-dark-green" />
            <TableData title={t("default:stats.guild.monthly")} value={n(monthly)} color="text-mc-dark-green" />
          </section>
        ))}
        <div className={cn("grid grid-cols-1 lg:grid-cols-2 lg:[&>:only-child]:col-span-2", BOX_GAP)}>
          {guild.history.length > 0 && (
            <BarList
              title={t("guild.history")}
              rows={guild.history.map(({ day, exp }) => ({ key: day, label: date.format(Date.parse(day)), value: exp }))}
            />
          )}
          {guild.expByGame.length > 0 && (
            <BarList
              title={t("guild.byGame")}
              rows={guild.expByGame.map(({ id, name, exp }) => ({ key: id, label: name, value: exp, icon: id }))}
            />
          )}
        </div>
        <MemberTable members={guild.members} total={guild.memberCount} />
        <Updated updatedAt={guild.updatedAt} />
      </div>
    </div>
  );
}

/** Its own component, so the clock's tick each second re-renders the line and not the page. */
function Updated({ updatedAt }: { updatedAt: number }) {
  const now = useNow();
  return <p className="text-mc-1.5 text-mc-gray empty:hidden">{now !== undefined && <UpdatedAt updatedAt={updatedAt} now={now} />}</p>;
}

type BarRow = { key: string; label: string; value: number; icon?: string };

/** Labelled numbers with a bar each against the largest, as a two-column list. */
function BarList({ title, rows }: { title: string; rows: BarRow[] }) {
  const n = useNumberFormat();
  const max = Math.max(...rows.map(({ value }) => value));

  return (
    <Box title={<h2 className="text-mc-1.5 text-mc-gray">{title}</h2>}>
      <ul className="flex flex-col gap-1.5 text-mc-1.5">
        {rows.map(({ key, label, value, icon }) => (
          <li key={key} className="grid grid-cols-[minmax(0,10rem)_1fr_auto] items-center gap-3">
            <span className="flex min-w-0 items-center gap-2">
              {icon && hasGameIcon(icon) && <span className="shrink-0"><GameIcon game={icon} /></span>}
              <span className="min-w-0 wrap-anywhere">{label}</span>
            </span>
            <span className="h-2 bg-black/30" aria-hidden>
              <span className="block h-full bg-mc-dark-green" style={{ width: `${max > 0 ? (value / max) * 100 : 0}%` }} />
            </span>
            <span className="text-end text-mc-dark-green">{n(value)}</span>
          </li>
        ))}
      </ul>
    </Box>
  );
}

const SORTS = {
  rank: (a: GuildMemberRow, b: GuildMemberRow) => b.rankPriority - a.rankPriority || a.joinTime - b.joinTime,
  name: (a: GuildMemberRow, b: GuildMemberRow) => a.username.localeCompare(b.username),
  joinTime: (a: GuildMemberRow, b: GuildMemberRow) => a.joinTime - b.joinTime,
  questParticipation: (a: GuildMemberRow, b: GuildMemberRow) => b.questParticipation - a.questParticipation,
  daily: (a: GuildMemberRow, b: GuildMemberRow) => b.daily - a.daily,
  weekly: (a: GuildMemberRow, b: GuildMemberRow) => b.weekly - a.weekly,
  monthly: (a: GuildMemberRow, b: GuildMemberRow) => b.monthly - a.monthly,
} as const;

type SortKey = keyof typeof SORTS;

/**
 * The members the API has names for, sorted by rank to start; each heading sorts by its column, and a second press
 * reverses it. Under it, how many of the guild's `total` it can't list yet.
 */
function MemberTable({ members, total }: { members: GuildMemberRow[]; total: number }) {
  const { t, i18n } = useTranslation();
  const n = useNumberFormat();
  const date = dateFormat(i18n.language);
  const [sort, setSort] = useState<{ key: SortKey; reversed: boolean }>({ key: "rank", reversed: false });
  const sorted = members.toSorted(SORTS[sort.key]);
  if (sort.reversed) sorted.reverse();

  const columns: { key: SortKey; label: string; numeric?: boolean; highestFirst?: boolean }[] = [
    { key: "name", label: t("guild.member") },
    { key: "rank", label: t("default:stats.guild.rank"), highestFirst: true },
    { key: "joinTime", label: t("default:stats.guild.joinedAt") },
    { key: "questParticipation", label: t("default:stats.guild.quests"), numeric: true, highestFirst: true },
    { key: "daily", label: t("default:stats.guild.daily"), numeric: true, highestFirst: true },
    { key: "weekly", label: t("default:stats.guild.weekly"), numeric: true, highestFirst: true },
    { key: "monthly", label: t("default:stats.guild.monthly"), numeric: true, highestFirst: true },
  ];

  return (
    <Box title={<h2 className="text-mc-1.5 text-mc-gray">{t("guild.members")} ({t("guild.memberCount", { count: total })})</h2>}>
      {members.length > 0 && (
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- Focus lets keyboard users scroll to columns off-screen.
        <section aria-label={t("guild.members")} tabIndex={0} className="overflow-x-auto focus-visible:focus-ring-inset">
          <table className="w-full text-mc-1.5">
            <caption className="sr-only">{t("guild.members")}</caption>
            <thead>
              <tr className="text-mc-gray">
                {columns.map(({ key, label, numeric, highestFirst = false }) => (
                  <th
                    key={key}
                    scope="col"
                    aria-sort={sort.key === key ? (highestFirst === sort.reversed ? "ascending" : "descending") : undefined}
                    className={cn("px-2 pb-2 font-normal whitespace-nowrap", numeric ? "text-end" : "text-start")}
                  >
                    <button
                      type="button"
                      className={cn("min-h-11 cursor-pointer hover:text-mc-white focus-visible:focus-ring-inset", sort.key === key && "text-mc-yellow")}
                      onClick={() => setSort({ key, reversed: sort.key === key && !sort.reversed })}
                    >
                      {label}
                      {sort.key === key && <span aria-hidden> {highestFirst === sort.reversed ? "↑" : "↓"}</span>}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((member) => (
                <tr key={member.uuid} className="border-t-2 border-black/20">
                  <th scope="row" className="px-2 py-1 text-start font-normal">
                    <Link
                      to="/{-$locale}/player/$name"
                      params={{ name: member.uuid }}
                      className="flex items-center gap-2 whitespace-nowrap hover:underline"
                    >
                      <SkinHead uuid={member.uuid} stored size={20} className="shrink-0" />
                      <MinecraftText>{member.displayName}</MinecraftText>
                    </Link>
                  </th>
                  <td className="px-2 py-1 whitespace-nowrap text-mc-yellow">{member.rank}</td>
                  <td className="px-2 py-1 whitespace-nowrap text-mc-dark-aqua">{date.format(member.joinTime)}</td>
                  <td className="px-2 py-1 text-end text-mc-aqua">{n(member.questParticipation)}</td>
                  <td className="px-2 py-1 text-end text-mc-dark-green">{n(member.daily)}</td>
                  <td className="px-2 py-1 text-end text-mc-dark-green">{n(member.weekly)}</td>
                  <td className="px-2 py-1 text-end text-mc-dark-green">{n(member.monthly)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
      {members.length < total && <p className={cn("text-mc-1.5 text-mc-gray", members.length > 0 && "mt-2")}>{t("guild.unlisted", { count: total - members.length })}</p>}
    </Box>
  );
}
