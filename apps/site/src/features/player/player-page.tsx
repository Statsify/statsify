/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Background } from "~/components/ui/background";
import { Box } from "~/components/ui/box";
import { Discord } from "~/components/icons/discord";
import { InlineStat, STAT_LINK, StatCell } from "~/components/ui/stat";
import { Link } from "@tanstack/react-router";
import { MinecraftText } from "~/components/ui/minecraft-text";
import { RefreshBar } from "./refresh-bar";
import { SignaturePanel } from "./signature-panel";
import { SkinBust } from "~/components/ui/skin";
import { Twitter } from "~/components/icons/twitter";
import { YouTube } from "~/components/icons/youtube";
import { cn } from "~/lib/util";
import { minigameXpBar } from "~/components/ui/progression";
import { orpc } from "~/lib/orpc";
import { playerPageQuery } from "./resolve";
import { refreshPlayer } from "./player-actions";
import { useNumberFormat } from "~/i18n/use-number-format";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import type { ComponentType } from "react";
import type { GameSummary, PlayerPage } from "@statsify/contract";

type Socials = PlayerPage["socials"];
type SocialKey = keyof Socials;

const SOCIAL_ICONS: Partial<Record<SocialKey, ComponentType<{ className?: string }>>> = {
  discord: Discord,
  twitter: Twitter,
  youtube: YouTube,
};

// The bot's colour per stat: wins and kills §a, deaths §c, ratios, score and coins §6,
// winstreaks §e, and the trophies in the bot's gold, silver and bronze. Anything else is §f.
const GREEN = "text-mc-green";
const GOLD = "text-mc-gold";

const ROW_COLORS: Record<string, string> = {
  wins: GREEN,
  overallWins: GREEN,
  murdererWins: GREEN,
  detectiveWins: GREEN,
  kills: GREEN,
  finalKills: GREEN,
  bedsBroken: GREEN,
  witherKills: GREEN,
  zombieKills: GREEN,
  headshotKills: GREEN,
  headshots: GREEN,
  mostVampireKills: GREEN,
  deaths: "text-mc-red",
  kdr: GOLD,
  fkdr: GOLD,
  wlr: GOLD,
  score: GOLD,
  shotAccuracy: GOLD,
  coins: GOLD,
  coinConversions: GOLD,
  gold: GOLD,
  zombiesWins: GREEN,
  tntRunWins: GREEN,
  wizardsKills: GREEN,
  coursesCompleted: GREEN,
  bestWinstreak: "text-mc-yellow",
  goldTrophies: "text-[#ffd700]",
  silverTrophies: "text-[#c0c0c0]",
  bronzeTrophies: "text-[#cd7f32]",
};

/**
 * The player page in the general card's order: nametag, then Network Level and the overview cells, then
 * logins, then one panel per game. Phones stack them with the refresh row under the nametag; from `lg` up identity
 * and level sit side by side.
 */
export function PlayerView({ page }: { page: PlayerPage }) {
  const queryClient = useQueryClient();

  // The refreshed page replaces the cached query, so every panel re-renders with the new numbers. The player's game
  // pages predate the refresh: they reload the next time they're shown.
  const refresh = async () => {
    const result = await refreshPlayer({ data: { uuid: page.uuid } });

    if (result.ok) {
      await queryClient.invalidateQueries({ queryKey: orpc.player.key({ input: { uuid: page.uuid } }), refetchType: "none" });
      queryClient.setQueryData(playerPageQuery(page.uuid).queryKey, result.data);
    }

    return result;
  };

  return (
    <div className="relative grow">
      <Background
        background="general"
        priority
        className="h-full"
        mask="linear-gradient(rgb(255 255 255) 30%, rgb(0 0 0 / 0) 95%)"
      />
      <div className="absolute h-full w-full bg-[rgb(17_17_17_/0.7)] -z-10" />
      <div className="w-container flex flex-col gap-4 px-4 py-6 text-mc-white md:px-8">
        <div className="grid grid-cols-1 gap-2 lg:grid-cols-[3fr_2fr]">
          <NametagPanel page={page} className="lg:col-start-1 lg:row-start-1" />
          <RefreshBar
            updatedAt={page.updatedAt}
            expiresAt={page.expiresAt}
            refresh={refresh}
            className="mb-2 lg:col-span-2 lg:row-start-3 lg:mt-2 lg:mb-0"
          />
          <NetworkLevelPanel level={page.level} className="lg:col-start-2 lg:row-start-1" />
          <OverviewPanel overview={page.overview} username={page.username} className="lg:col-start-1 lg:row-start-2" />
          <LoginPanel status={page.status} className="lg:col-start-2 lg:row-start-2" />
        </div>
        <GameGrid games={page.games} username={page.username} />
        <SignaturePanel page={page} />
      </div>
    </div>
  );
}

function NametagPanel({ page, className }: { page: PlayerPage; className?: string }) {
  const { t } = useTranslation();

  return (
    <Box className={cn("content:flex content:h-full content:items-center content:gap-4", className)}>
      <SkinBust uuid={page.uuid} className="h-24 w-16 shrink-0 sm:h-40 sm:w-28" />
      <div className="flex min-w-0 grow flex-col gap-3">
        {/* Rank, name and guild tag as on the card; a long name wraps onto a second line rather than widening the page. */}
        <p className="wrap-break-word text-mc-2">
          <MinecraftText>{page.displayName}</MinecraftText>
          {page.guild?.tagFormatted && (
            <>
              {" "}
              <MinecraftText>{page.guild.tagFormatted}</MinecraftText>
            </>
          )}
        </p>
        <dl className="flex flex-col gap-1">
          {page.guild && <InlineStat label={t("default:stats.guild.guild")} value={page.guild.name} color="text-mc-dark-green" />}
        </dl>
        <SocialLinks socials={page.socials} />
      </div>
    </Box>
  );
}

/** The handle in a social link: the last part of a URL (`youtube.com/@anrie` → `anrie`), or the value itself. */
function socialHandle(value: string): string {
  const path = value.replace(/^https?:\/\//i, "").replace(/[?#].*$/, "").replace(/\/+$/, "");
  const handle = path.slice(path.lastIndexOf("/") + 1);
  return handle.replace(/^@/, "") || value;
}

function socialHref(value: string): string | undefined {
  if (/^https?:\/\//i.test(value)) return value;
  if (/^[\w.-]+\.[a-z]{2,}(?:\/|$)/i.test(value)) return `https://${value}`;
  return undefined;
}

function SocialLinks({ socials }: { socials: Socials }) {
  const entries = (Object.entries(socials) as [SocialKey, string | undefined][]).filter(
    (entry): entry is [SocialKey, string] => !!entry[1]
  );

  if (entries.length === 0) return null;

  // An icon (or the network's name) and the handle, never the raw URL; links are 44 px tall.
  return (
    <ul className="flex min-w-0 max-w-full flex-wrap gap-x-4">
      {entries.map(([key, value]) => {
        const Icon = SOCIAL_ICONS[key];
        const href = socialHref(value);
        const content = (
          <>
            {Icon ? <Icon className="size-5 shrink-0" /> : <span className="text-mc-1 text-mc-gray capitalize">{key}</span>}
            <span className="max-w-40 truncate">{socialHandle(value)}</span>
          </>
        );

        return (
          <li key={key} className="min-w-0">
            {href ?
              (
                <a href={href} target="_blank" rel="noreferrer noopener" className="flex min-h-11 items-center gap-2 text-mc-1.5 hover:underline">
                  {content}
                </a>
              ) :
              (
                <span className="flex min-h-11 items-center gap-2 text-mc-1.5">{content}</span>
              )}
          </li>
        );
      })}
    </ul>
  );
}

function NetworkLevelPanel({ level, className }: { level: PlayerPage["level"]; className?: string }) {
  const { t } = useTranslation();
  const n = useNumberFormat();
  const current = Math.floor(level.level);

  return (
    <Box className={cn("content:flex content:h-full content:flex-col content:items-center content:justify-center content:gap-3", className)}>
      <dl>
        <StatCell label={t("default:stats.networkLevel")} value={n(level.level)} color="text-mc-gold" />
      </dl>
      <MinecraftText className="text-mc-1.5">{`§6${current} ${minigameXpBar(level.percent)} §6${current + 1}`}</MinecraftText>
      <dl className="flex flex-wrap justify-center gap-x-6 gap-y-1">
        <InlineStat
          label={t("default:stats.exp")}
          value={(
            <>
              <span className="text-mc-aqua">{n(level.current)}</span>/<span className="text-mc-green">{n(level.max)}</span>
            </>
          )}
        />
        <InlineStat label={t("player.multiplier")} value={`x${n(level.multiplier)}`} color="text-mc-gold" />
      </dl>
    </Box>
  );
}

function OverviewPanel({ overview, username, className }: { overview: PlayerPage["overview"]; username: string; className?: string }) {
  const { t } = useTranslation();
  const n = useNumberFormat();

  // The general card's cells and colours: points §6, quests and challenges §a, karma and streaks §d, gifts §5. A cell
  // with a page of its own links to it.
  const cells: [label: string, value: number, color: string, page?: string][] = [
    [t("default:stats.achievementPoints"), overview.achievementPoints, "text-mc-gold"],
    [t("default:stats.karma"), overview.karma, "text-mc-pink"],
    [t("default:stats.quests"), overview.quests, "text-mc-green"],
    [t("default:stats.challenges"), overview.challenges, "text-mc-green", "challenges"],
    [t("default:stats.rewardStreak"), overview.currentRewardStreak, "text-mc-pink"],
    [t("player.highestStreak"), overview.highestRewardStreak, "text-mc-pink"],
    [t("default:stats.giftsSent"), overview.giftsSent, "text-mc-dark-purple"],
    [t("default:stats.ranksGifted"), overview.ranksGifted, "text-mc-dark-purple"],
  ];

  // The card's guild row, for a guild member. `ns`, not a `default:` prefix: the GEXP labels nest `$t(stats.guild.…)`,
  // which i18next resolves in the call's namespace, so with the prefix they print as keys.
  if (overview.guildMember) {
    const { questParticipation, daily, weekly } = overview.guildMember;
    cells.push(
      [t("stats.guild.quests", { ns: "default" }), questParticipation, "text-mc-dark-green"],
      [t("stats.guild.daily-gexp", { ns: "default" }), daily, "text-mc-dark-green"],
      [t("stats.guild.weekly-gexp", { ns: "default" }), weekly, "text-mc-dark-green"],
    );
  }

  return (
    <Box className={cn("content:h-full", className)}>
      <dl className="grid h-full grid-cols-2 content-center gap-x-2 gap-y-4 sm:grid-cols-4 max-sm:[&>:last-child:nth-child(odd)]:col-span-2">
        {cells.map(([label, value, color, page]) => (
          <StatCell
            key={label}
            label={label}
            value={page ?
              (
                <Link to="/{-$locale}/player/$name/$game" params={{ name: username, game: page }} className={STAT_LINK}>
                  {n(value)}
                  <span className="sr-only"> {t("player.page", { name: label })}</span>
                </Link>
              ) :
              n(value)}
            color={color}
            className={page && "relative"}
          />
        ))}
      </dl>
    </Box>
  );
}

function LoginPanel({ status, className }: { status: PlayerPage["status"]; className?: string }) {
  const { t, i18n } = useTranslation();

  // The card's `LL/dd/yy, hh:mm a`, in UTC on both server and browser so the HTML hydrates without a mismatch.
  const format = new Intl.DateTimeFormat(i18n.language, {
    month: "2-digit",
    day: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
  const date = (ms: number) => (ms > 0 ? `${format.format(ms)} UTC` : t("player.na"));

  return (
    <Box className={cn("content:flex content:h-full content:flex-col content:justify-center", className)}>
      <dl className="flex flex-col gap-2">
        <InlineStat
          label={t("default:stats.status")}
          value={status.online ? t("default:stats.online") : t("default:stats.offline")}
          color={status.online ? "text-mc-green" : "text-mc-red"}
        />
        <InlineStat label={t("default:stats.firstLogin")} value={date(status.firstLogin)} color="text-mc-dark-aqua" />
        <InlineStat label={t("default:stats.lastLogin")} value={date(status.lastLogin)} color="text-mc-dark-aqua" />
        <InlineStat
          label={t("default:stats.lastGame")}
          value={status.lastGame ? <MinecraftText>{status.lastGame.name}</MinecraftText> : t("player.na")}
        />
      </dl>
    </Box>
  );
}

function GameGrid({ games, username }: { games: GameSummary[]; username: string }) {
  const { t } = useTranslation();

  if (games.length === 0) return <p className="text-mc-1.5 text-mc-gray text-center">{t("player.noGames")}</p>;

  // Two 32 px cells side by side need about 300 px, so columns are added only when every panel keeps that width.
  return (
    <ul className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {games.map((game) => (
        <li key={game.id}>
          <GamePanel game={game} username={username} />
        </li>
      ))}
    </ul>
  );
}

/** A game's headline numbers; a game with its own page links to it from the whole panel. */
function GamePanel({ game, username }: { game: GameSummary; username: string }) {
  const { t } = useTranslation();
  const n = useNumberFormat();
  const title = <MinecraftText className="text-mc-1.5">{`§l${game.name}${game.level ? `§r ${game.level}` : ""}`}</MinecraftText>;

  return (
    <Box
      className="h-full"
      title={game.page ?
        (
          <Link to="/{-$locale}/player/$name/$game" params={{ name: username, game: game.page }} className={STAT_LINK}>
            {title}
            {/* Text, not an icon, so the title bar keeps the height of every other panel's. */}
            <span aria-hidden className="text-mc-1.5 text-mc-gray"> »</span>
          </Link>
        ) :
        title}
    >
      <dl className="grid grid-cols-2 gap-x-2 gap-y-4">
        {game.rows.map((row) => (
          <StatCell
            key={row.key}
            label={t(`stats.${row.key}`, { ns: ["default", "site"] })}
            value={typeof row.value === "number" ?
              <>{n(row.value)}{row.suffix}</> :
              <MinecraftText>{row.value}</MinecraftText>}
            color={ROW_COLORS[row.key]}
          />
        ))}
      </dl>
    </Box>
  );
}
