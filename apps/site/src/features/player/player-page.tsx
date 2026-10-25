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
import { GameNav } from "~/features/game/game-nav";
import { Hint, Spoken } from "~/components/ui/hint";
import { IMAGE_VARIANTS } from "@statsify/profiles/protocol";
import { Hidden, InlineStat, LeaderboardLink, SNAP_LARGE, STAT_LINK, StatCell, StatNumber, linkHint, useStatName } from "~/components/ui/stat";
import { Link } from "@tanstack/react-router";
import { MinecraftText, colourOf } from "~/components/ui/minecraft-text";
import { MiniHeader } from "./mini-header";
import { PanelToggle, SharePanel, useRevealOnOpen } from "./share-panel";
import { RefreshBar, savedDate, useNow } from "./refresh-bar";
import { SignaturePanel } from "./signature-panel";
import { SkinBust } from "~/components/ui/skin";
import { Twitter } from "~/components/icons/twitter";
import { YouTube } from "~/components/icons/youtube";
import { cn } from "~/lib/util";
import { minigameXpBar } from "~/components/ui/progression";
import { orpc } from "~/lib/orpc";
import { playerPageQuery } from "./resolve";
import { refreshPlayer } from "./player-actions";
import { relativeTime } from "~/i18n/format";
import { addRecentPlayer } from "./recent";
import { useExactNumber, useNumberFormat } from "~/i18n/use-number-format";
import { useQueryClient } from "@tanstack/react-query";
import { Suspense, lazy, useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { ComponentType, ReactNode, Ref } from "react";
import type { GameSummary, PlayerPage } from "@statsify/contract";

// Its own chunk, fetched when a pointer or the keyboard reaches the Skin button, or else when the panel opens.
const loadSkinPanel = () => import("./skin-viewer");
const SkinPanel = lazy(() => loadSkinPanel().then(({ SkinPanel }) => ({ default: SkinPanel })));

type Socials = PlayerPage["socials"];
type SocialKey = keyof Socials;

const SOCIAL_ICONS: Partial<Record<SocialKey, ComponentType<{ className?: string }>>> = {
  discord: Discord,
  twitter: Twitter,
  youtube: YouTube,
};

/**
 * The player page in the general card's order: nametag, then Network Level and the overview cells, then
 * logins, then one panel per game. Phones stack them with the refresh row under the nametag. From `md` the logins join
 * the nametag and the level and overview share a row; from `xl` nametag, level and overview are one row.
 */
export function PlayerView({ page }: { page: PlayerPage }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const nametag = useRef<HTMLDivElement>(null);
  const shareId = useId();
  const skinId = useId();
  const [sharing, setSharing] = useState(false);
  const [skin, setSkin] = useState(false);
  const navGames = page.games.flatMap(({ page: key, id, name }) => (key ? [{ key, id, name, played: true }] : []));

  useEffect(() => addRecentPlayer({ uuid: page.uuid, name: page.username }), [page.uuid, page.username]);

  // The refreshed page replaces the cached query, so every panel re-renders with the new numbers. The player's game
  // pages predate the refresh: they reload the next time they're shown.
  const refresh = async (deadline: AbortSignal, auto: boolean) => {
    const result = await refreshPlayer({ data: { uuid: page.uuid, auto }, signal: deadline });

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
        viewport
        className="h-full"
        mask="linear-gradient(rgb(255 255 255) 30%, rgb(0 0 0 / 0) 95%)"
      />
      <div className="absolute h-full w-full bg-[rgb(17_17_17_/0.7)] -z-10" />
      <MiniHeader watch={nametag} uuid={page.uuid} name={page.displayName} />
      <div className="w-container flex flex-col gap-4 px-4 py-6 text-mc-white md:px-8">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-[auto_1fr] xl:grid-cols-[fit-content(50%)_auto_1fr]">
          <NametagPanel
            ref={nametag}
            page={page}
            actions={(
              <>
                <PanelToggle open={sharing} controls={shareId} onToggle={() => setSharing(!sharing)} size="text-mc-1.5">
                  {t("player.share.open")}
                </PanelToggle>
                <PanelToggle
                  open={skin}
                  controls={skinId}
                  onToggle={() => setSkin(!skin)}
                  size="text-mc-1.5"
                  // A chunk that fails here fails again when the panel opens, which shows the error.
                  onIntent={() => loadSkinPanel().catch(() => undefined)}
                >
                  {t("player.skin.open")}
                </PanelToggle>
              </>
            )}
            className="md:col-span-full md:row-start-1 xl:col-span-1"
          />
          <RefreshBar
            updatedAt={page.updatedAt}
            expiresAt={page.expiresAt}
            refresh={refresh}
            auto
            className="mb-2 md:col-span-full md:row-start-3 md:mt-2 md:mb-0 xl:row-start-2"
          />
          <NetworkLevelPanel level={page.level} username={page.username} className="md:col-start-1 md:row-start-2 xl:col-start-2 xl:row-start-1" />
          <OverviewPanel overview={page.overview} username={page.username} className="md:col-start-2 md:row-start-2 xl:col-start-3 xl:row-start-1" />
          <LoginPanel page={page} className="md:hidden" />
        </div>
        {sharing && (
          <SharePanel
            id={shareId}
            name={page.username}
            card={{ src: `/og/${page.uuid}.png?v=${page.updatedAt}`, ...IMAGE_VARIANTS.og }}
            file={`${page.username}.png`}
            uuid={page.uuid}
          />
        )}
        {skin && (
          <Suspense fallback={<SkinPanelFrame id={skinId} />}>
            <SkinPanel id={skinId} uuid={page.uuid} name={page.username} />
          </Suspense>
        )}
        {/* On phones a Games button heads the games' panels, so a game page is a tap away rather than a long scroll;
            its grid lies over the panels. From `md` the panels are near enough. */}
        {page.games.length > 0 && (
          <div className="relative md:hidden">
            <GameNav games={navGames} username={page.username} wide />
          </div>
        )}
        <GameGrid games={page.games} username={page.username} />
        <SignaturePanel page={page} />
      </div>
    </div>
  );
}

/** The skin panel while its chunk loads: its title over the model's room, brought into view as the panel would be. */
function SkinPanelFrame({ id }: { id: string }) {
  const { t } = useTranslation();
  useRevealOnOpen(id);

  return (
    <Box id={id} title={<h2 className="text-mc-1.5">{t("player.skin.title")}</h2>} className="content:flex content:flex-col content:gap-4">
      <div className="h-80 w-64 self-center" />
    </Box>
  );
}

function NametagPanel({
  page,
  actions,
  className,
  ref,
}: {
  page: PlayerPage;
  /** Buttons after the socials that open panels under the header. */
  actions: ReactNode;
  className?: string;
  ref?: Ref<HTMLDivElement>;
}) {
  const { t } = useTranslation();

  return (
    <Box
      ref={ref}
      className={cn(
        "content:flex content:h-full content:items-center content:gap-4",
        "md:content:grid md:content:grid-cols-[auto_minmax(0,1fr)_auto] xl:content:grid-cols-[auto_minmax(0,1fr)] xl:content:content-center xl:content:gap-y-3",
        className
      )}
    >
      <SkinBust uuid={page.uuid} className="h-24 w-16 shrink-0 sm:h-40 sm:w-28 xl:row-span-2" />
      <div className="flex min-w-0 grow flex-col gap-3">
        {/* Rank, name and guild tag as on the card; a long name wraps onto a second line rather than widening the page. */}
        <h1 className="wrap-break-word text-mc-2">
          <MinecraftText>{page.displayName}</MinecraftText>
          {page.guild?.tagFormatted && (
            <>
              {" "}
              <MinecraftText>{page.guild.tagFormatted}</MinecraftText>
            </>
          )}
        </h1>
        <dl className="flex flex-col gap-1">
          {page.guild && <InlineStat label={t("default:stats.guild.guild")} value={page.guild.name} color="text-mc-dark-green" large />}
        </dl>
        <div className="flex flex-wrap items-center gap-x-4">
          <SocialLinks socials={page.socials} />
          {actions}
        </div>
      </div>
      <LoginList page={page} className="hidden md:flex xl:col-start-2" />
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

function NetworkLevelPanel({ level, username, className }: { level: PlayerPage["level"]; username: string; className?: string }) {
  const { t } = useTranslation();
  const n = useNumberFormat();
  const statName = useStatName();
  const current = Math.floor(level.level);
  const bar = <MinecraftText className="text-mc-1.5">{`§6${current} ${minigameXpBar(level.percent)} §6${current + 1}`}</MinecraftText>;

  return (
    <Box className={cn("content:flex content:h-full content:flex-col content:items-center content:justify-center content:gap-3", className)}>
      <dl>
        <StatCell
          label={t("default:stats.networkLevel")}
          value={(
            <LeaderboardLink field="stats.general.networkExp" username={username} stat={t("default:stats.networkLevel")}>
              {n(level.level)}
            </LeaderboardLink>
          )}
          color="text-mc-gold"
          large
          className="relative"
        />
      </dl>
      <span className={SNAP_LARGE}>{bar}</span>
      <dl className="flex flex-wrap justify-center gap-x-6 gap-y-1">
        <InlineStat
          label={<Hint full={statName("stats.exp")}>{t("default:stats.exp")}</Hint>}
          value={(
            <>
              <span className="text-mc-aqua"><StatNumber value={level.current} /></span>/
              <span className="text-mc-green"><StatNumber value={level.max} /></span>
            </>
          )}
          large
        />
        <InlineStat label={t("player.multiplier")} value={`x${n(level.multiplier)}`} color="text-mc-gold" large />
      </dl>
    </Box>
  );
}

function OverviewPanel({ overview, username, className }: { overview: PlayerPage["overview"]; username: string; className?: string }) {
  const { t } = useTranslation();
  const n = useNumberFormat();
  const exact = useExactNumber();

  // The general card's cells and colours: points §6, quests and challenges §a, karma and streaks §d, gifts §5. Quests
  // and Challenges link to their pages, the rest to their leaderboards (`stats.general.<board>`).
  const cells: [label: string, value: number, color: string, link?: { page: string } | { board: string }][] = [
    [t("default:stats.achievementPoints"), overview.achievementPoints, "text-mc-gold", { board: "achievementPoints" }],
    [t("default:stats.karma"), overview.karma, "text-mc-pink", { board: "karma" }],
    [t("default:stats.quests"), overview.quests, "text-mc-green", { page: "quests" }],
    [t("default:stats.challenges"), overview.challenges, "text-mc-green", { page: "challenges" }],
    [t("default:stats.rewardStreak"), overview.currentRewardStreak, "text-mc-pink", { board: "currentRewardStreak" }],
    [t("player.highestStreak"), overview.highestRewardStreak, "text-mc-pink", { board: "highestRewardStreak" }],
    [t("default:stats.giftsSent"), overview.giftsSent, "text-mc-dark-purple", { board: "giftsSent" }],
    [t("default:stats.ranksGifted"), overview.ranksGifted, "text-mc-dark-purple", { board: "ranksGifted" }],
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
      {/* Two wide beside the level from `xl`, unless the guild row's three cells need the four columns. Columns never
          get narrower than their values, so the row takes its room from the nametag rather than run values together. */}
      <dl
        className={cn(
          "grid h-full grid-cols-snap-2 content-center gap-x-2 gap-y-4 sm:grid-cols-snap-4 max-sm:[&>:last-child:nth-child(odd)]:col-span-2",
          !overview.guildMember && "xl:grid-cols-snap-2"
        )}
      >
        {cells.map(([label, value, color, link]) => (
          <StatCell
            key={label}
            label={label}
            value={link && "page" in link ?
              (
                <Link to="/{-$locale}/player/$name/$game" params={{ name: username, game: link.page }} className={STAT_LINK}>
                  <Spoken full={exact(value)}>{n(value)}</Spoken>
                  <span className="sr-only"> {t("player.page", { name: label })}</span>
                </Link>
              ) :
              link ?
                (
                  <LeaderboardLink field={`stats.general.${link.board}`} username={username} stat={label} hint={exact(value)}>
                    <Spoken full={exact(value)}>{n(value)}</Spoken>
                  </LeaderboardLink>
                ) :
                <StatNumber value={value} />}
            color={color}
            large
            className={link && "relative"}
          />
        ))}
      </dl>
    </Box>
  );
}

function LoginPanel({ page, className }: { page: PlayerPage; className?: string }) {
  return (
    <Box className={cn("content:flex content:h-full content:flex-col content:justify-center", className)}>
      <LoginList page={page} />
    </Box>
  );
}

/**
 * Status and logins as the card's header lists them: in the nametag from `md`, in their own panel on phones. The last
 * game links to its page where the player has one for it.
 */
function LoginList({ page: { uuid, status, games, username, updatedAt, expiresAt }, className }: { page: PlayerPage; className?: string }) {
  const { t } = useTranslation();
  const lastGame = status.lastGame && <MinecraftText>{status.lastGame.name}</MinecraftText>;
  const lastGamePage = games.find((game) => game.id === status.lastGame?.id)?.page;

  return (
    <dl className={cn("flex flex-col gap-2", className)}>
      {status.statusHidden ?
        <InlineStat label={t("default:stats.status")} value={<HiddenStatus />} color="text-mc-gray" large /> :
        (
          <InlineStat
            label={t("default:stats.status")}
            value={status.online ? <OnlineStatus uuid={uuid} updatedAt={updatedAt} expiresAt={expiresAt} /> : t("default:stats.offline")}
            color={status.online ? "text-mc-green" : "text-mc-red"}
            large
          />
        )}
      <InlineStat label={t("default:stats.firstLogin")} value={<LoginDate ms={status.firstLogin} />} color="text-mc-dark-aqua" large />
      <InlineStat label={t("default:stats.lastLogin")} value={<LoginDate ms={status.lastLogin} />} color="text-mc-dark-aqua" large />
      <InlineStat label={t("default:stats.logoutTime")} value={<LoginDate ms={status.lastLogout} />} color="text-mc-dark-aqua" large />
      <InlineStat
        label={t("default:stats.lastGame")}
        value={lastGame && lastGamePage ?
          (
            <Link to="/{-$locale}/player/$name/$game" params={{ name: username, game: lastGamePage }} className="hover:underline">
              {lastGame}
            </Link>
          ) :
          (lastGame ?? t("player.na"))}
        large
      />
    </dl>
  );
}

/**
 * "Online" while the save is fresh (until Refresh unlocks); after that, how long ago the save saw them online, with its
 * full date on hover, focus or tap. Until mount the clock is when the server fetched the page, which the browser gets
 * with the page's data, so a cached page hydrates to the server's text; the browser's own clock takes over after.
 */
function OnlineStatus({ uuid, updatedAt, expiresAt }: { uuid: string; updatedAt: number; expiresAt: number }) {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const now = useNow();
  const clock = now ?? queryClient.getQueryState(playerPageQuery(uuid).queryKey)?.dataUpdatedAt ?? updatedAt;
  const online = t("default:stats.online");
  const ago = clock < expiresAt ? undefined : relativeTime(updatedAt, clock, i18n.language, { style: "narrow" });
  const date = now === undefined || ago === undefined ? undefined : savedDate(updatedAt, i18n.language);

  return (
    <Hint full={date} spoken={date && `${online} · ${ago}, ${date}`}>
      {online}
      {ago && <span className="text-mc-gray"> · {ago}</span>}
    </Hint>
  );
}

/** Hidden, where the player hides their online status in Hypixel's API settings, which the hint says. */
function HiddenStatus() {
  const { t } = useTranslation();
  const hidden = t("default:stats.hidden");
  const hint = t("player.statusHidden");

  return <Hint full={hint} spoken={`${hidden}. ${hint}`}>{hidden}</Hint>;
}

const twoDigits = (value: number) => String(value).padStart(2, "0");

/**
 * The card's `LL/dd/yy, hh:mm a` in UTC, from the date's parts rather than `Intl`: ICU versions differ in the space
 * before AM/PM, so the server's text and the browser's could differ and break hydration.
 */
function loginText(ms: number): string {
  const date = new Date(ms);
  const hours = date.getUTCHours();
  const day = `${twoDigits(date.getUTCMonth() + 1)}/${twoDigits(date.getUTCDate())}/${twoDigits(date.getUTCFullYear() % 100)}`;
  return `${day}, ${twoDigits(hours % 12 || 12)}:${twoDigits(date.getUTCMinutes())} ${hours < 12 ? "AM" : "PM"}`;
}

/** A login date as the card prints it. Once the page has mounted, how long ago it was shows on hover, focus or tap. */
function LoginDate({ ms }: { ms: number }) {
  const { t, i18n } = useTranslation();
  const now = useNow();
  if (ms <= 0) return t("player.na");

  const text = `${loginText(ms)} UTC`;
  // `now` is undefined until mount, so the server's HTML and the first render carry no clock value.
  const ago = now === undefined ? undefined : relativeTime(ms, now, i18n.language);

  return <Hint full={ago} spoken={ago && `${text}, ${ago}`}>{text}</Hint>;
}

export function GameGrid({ games, username }: { games: GameSummary[]; username: string }) {
  const { t } = useTranslation();

  if (games.length === 0) return <p className="text-mc-1.5 text-mc-gray text-center">{t("player.noGames", { name: username })}</p>;

  // Two 32 px cells side by side need about 300 px, so columns are added only when every panel keeps that width.
  return (
    <ul className="grid grid-cols-1 gap-2 md:grid-cols-snap-2 lg:grid-cols-snap-3 xl:grid-cols-snap-4">
      {games.map((game) => (
        <li key={game.id}>
          <GamePanel game={game} username={username} />
        </li>
      ))}
    </ul>
  );
}

/**
 * A game's headline numbers, each linking to its leaderboard at the player's row, and the rest of the panel to the
 * game's page where it has one. A linked number shows its label's full name and exact number on hover and keyboard
 * focus, as on the game page; a tap elsewhere follows the panel's link, so there they're for screen readers only.
 */
function GamePanel({ game, username }: { game: GameSummary; username: string }) {
  const { t } = useTranslation();
  const n = useNumberFormat();
  const exact = useExactNumber();
  const statName = useStatName();
  const title = <MinecraftText className="text-mc-1.5">{`§l${game.name}${game.level ? `§r ${game.level}` : ""}`}</MinecraftText>;

  return (
    <Box
      className="h-full"
      title={(
        <h2>
          {game.page ?
            (
              <Link to="/{-$locale}/player/$name/$game" params={{ name: username, game: game.page }} className={STAT_LINK}>
                {title}
                {/* Text, not an icon, so the title bar keeps the height of every other panel's. */}
                <span aria-hidden className="text-mc-1.5 text-mc-gray"> »</span>
              </Link>
            ) :
            title}
        </h2>
      )}
    >
      <dl className="grid grid-cols-snap-2 gap-x-2 gap-y-4">
        {game.rows.map((row) => {
          const label = t(`stats.${row.key}`, { ns: ["default", "site"] });
          const full = statName(`stats.${row.key}`);
          const exactValue = typeof row.value === "number" ? exact(row.value) : undefined;
          // Text the API formatted takes the stat's colour, unless it brings its own (Layers' 74/100).
          const value = row.hidden ?
            <Hidden /> :
            typeof row.value === "number" ?
              <><Spoken full={exactValue}>{n(row.value)}</Spoken>{row.suffix}</> :
              <MinecraftText>{`${row.colour}${row.value}`}</MinecraftText>;
          const { className, style } = colourOf(row.colour);

          return (
            <StatCell
              key={row.key}
              label={row.name === undefined ? <Spoken full={full}>{label}</Spoken> : <MinecraftText>{`${row.colour}${row.name}`}</MinecraftText>}
              value={row.leaderboard ?
                (
                  <LeaderboardLink field={row.leaderboard} username={username} stat={full ?? label} hint={linkHint(full, exactValue)}>
                    {value}
                  </LeaderboardLink>
                ) :
                value}
              color={className}
              style={style}
              className={row.leaderboard ? "relative" : undefined}
            />
          );
        })}
      </dl>
    </Box>
  );
}
