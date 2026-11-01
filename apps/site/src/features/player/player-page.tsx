/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { PageBackground } from "~/components/ui/background";
import { BOX_GAP, Box, CELL, HEADING_BOX, StatBox } from "~/components/ui/box";
import { ClockScript } from "~/lib/clock";
import { Discord } from "~/components/icons/discord";
import { Forums } from "~/components/icons/forums";
import { GameNav } from "~/features/game/game-nav";
import { gameLink } from "~/features/game/game-data";
import { Hint, Spoken } from "~/components/ui/hint";
import { Instagram } from "~/components/icons/instagram";
import { IMAGE_VARIANTS } from "@statsify/profiles/protocol";
import { Hidden, InlineStat, LeaderboardLink, SNAP_LARGE, STAT_LINK, StatCell, StatNumber, linkHint, useStatName } from "~/components/ui/stat";
import { Link } from "@tanstack/react-router";
import { MinecraftText, colourOf, nameColour } from "~/components/ui/minecraft-text";
import { MiniHeader } from "./mini-header";
import { PanelToggle, SharePanel, useRevealOnOpen } from "./share-panel";
import { LoginDate } from "./login-date";
import { RefreshBar, savedDate, useNow } from "./refresh-bar";
import { SignaturePanel } from "./signature-panel";
import { SkinBust, SkinHead } from "~/components/ui/skin";
import { TikTok } from "~/components/icons/tiktok";
import { Twitch } from "~/components/icons/twitch";
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
import { LABEL_NAMESPACES } from "~/i18n/i18n";
import { UUID_PATTERN } from "~/lib/uuid";
import type { ComponentType, ReactNode, Ref } from "react";
import type { GameSummary, PlayerPage } from "@statsify/contract";

// Its own chunk, fetched when a pointer or the keyboard reaches the Skin button, or else when the panel opens.
const loadSkinPanel = () => import("./skin-viewer");
const SkinPanel = lazy(() => loadSkinPanel().then(({ SkinPanel }) => ({ default: SkinPanel })));

type Socials = PlayerPage["socials"];
type SocialKey = keyof Socials;

const SOCIAL_ICONS: Record<SocialKey, ComponentType<{ className?: string }>> = {
  discord: Discord,
  forums: Forums,
  instagram: Instagram,
  tiktok: TikTok,
  twitch: Twitch,
  twitter: Twitter,
  youtube: YouTube,
};

/**
 * The player page in the general card's order: nametag and logins, then Network Level and the overview cells, then
 * one panel per game. Phones stack them with the refresh row under the nametag. From `md` the level and overview share
 * a row; from `xl` nametag, level and overview are one row.
 */
export function PlayerView({ page }: { page: PlayerPage }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const nametag = useRef<HTMLDivElement>(null);
  const shareId = useId();
  const skinId = useId();
  const [sharing, setSharing] = useState(false);
  const [skin, setSkin] = useState(false);
  const navGames = page.games.map(({ page: key, id, name }) => ({ key, id, name, played: true }));

  useEffect(
    () => addRecentPlayer({ uuid: page.uuid, name: page.username, colour: nameColour(page.displayName) }),
    [page.uuid, page.username, page.displayName]
  );

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
      <PageBackground background="general" />
      <MiniHeader watch={nametag} uuid={page.uuid} name={page.displayName} />
      <div className="w-container flex flex-col gap-4 px-4 py-6 text-mc-white md:px-8">
        <div className={cn("grid grid-cols-1 md:grid-cols-[auto_1fr] xl:grid-cols-[fit-content(50%)_auto_1fr]", BOX_GAP)}>
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
            className="mb-2 md:col-span-full md:row-start-3 md:mt-2 md:mb-0 xl:row-start-3"
          />
          {/* From `xl` the nametag shares its row with the level and overview, too narrow for the facts' values, so they
              get a row of their own, three across, the last row filled; below that `NametagPanel` draws them. */}
          <PlayerFacts page={page} className="hidden xl:col-span-full xl:row-start-2 xl:grid xl:grid-cols-3 xl:[&>:last-child:nth-child(3n+1)]:col-span-3 xl:[&>:last-child:nth-child(3n+2)]:col-span-2" />
          <NetworkLevelPanel level={page.level} username={page.username} className="md:col-start-1 md:row-start-2 xl:col-start-2 xl:row-start-1" />
          <OverviewPanel overview={page.overview} username={page.username} className="md:col-start-2 md:row-start-2 xl:col-start-3 xl:row-start-1" />
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
            <GameNav games={navGames} scope={{ kind: "player", name: page.username }} wide />
          </div>
        )}
        <GameGrid games={page.games} username={page.username} />
        <SignaturePanel page={page} />
      </div>
    </div>
  );
}

/**
 * A player's page while its data loads, past `DELAY_MS`: the name the link had and the head a search showed for it,
 * where the nametag goes, so picking a player answers at once. A UUID in the URL has no name or head to show yet.
 */
export function PlayerShell({ name }: { name: string }) {
  const { t } = useTranslation();
  const known = !UUID_PATTERN.test(name);

  return (
    <div className="relative grow" aria-busy>
      <PageBackground background="general" />
      <div className="w-container flex flex-col gap-4 px-4 py-6 text-mc-white md:px-8">
        <div className={cn("grid grid-cols-[auto_minmax(0,1fr)] md:w-fit md:min-w-sm", BOX_GAP)}>
          <Box className="content:flex content:items-center content:justify-center content:p-3">
            <div className="flex h-24 w-16 items-center justify-center sm:h-40 sm:w-28">
              {known && <SkinHead name={name} size={64} className="drop-shadow-mc-4 text-mc-black" />}
            </div>
          </Box>
          <Box className="content:flex content:items-center content:justify-center content:p-3 content:text-center">
            <h1 className="max-w-full wrap-break-word text-mc-2 text-mc-gray">{known ? name : t("nav.loading")}</h1>
          </Box>
        </div>
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
  // The card's header split into its boxes: the skin down the side, the name with the socials and buttons beside it,
  // and under that a box per fact. On phones the facts take the whole width under the skin and name; from `xl`, a row
  // of their own under the panels (`PlayerView`).
  return (
    <div ref={ref} className={cn("grid grid-cols-[auto_minmax(0,1fr)]", BOX_GAP, className)}>
      <Box className="md:row-span-2 content:flex content:items-center content:justify-center content:p-3">
        <SkinBust uuid={page.uuid} className="h-24 w-16 shrink-0 sm:h-40 sm:w-28" />
      </Box>
      <Box className="content:flex content:flex-col content:items-center content:justify-center content:gap-2 content:p-3 content:text-center">
        {/* Rank, name and guild tag as on the card; a long name wraps onto a second line rather than widening the page. */}
        <h1 className="max-w-full wrap-break-word text-mc-2">
          <MinecraftText>{page.displayName}</MinecraftText>
          {page.guild?.tagFormatted && (
            <>
              {" "}
              <Link to="/{-$locale}/guild/$name" params={{ name: page.guild.name }} className="hover:underline">
                <MinecraftText>{page.guild.tagFormatted}</MinecraftText>
              </Link>
            </>
          )}
        </h1>
        <div className="flex max-w-full flex-wrap items-center justify-center gap-x-4">
          <SocialLinks socials={page.socials} />
          {actions}
        </div>
      </Box>
      <PlayerFacts page={page} className="col-span-full md:col-span-1 md:col-start-2 xl:hidden" />
    </div>
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
  const { t } = useTranslation();
  const entries = (Object.entries(socials) as [SocialKey, string | undefined][]).filter(
    (entry): entry is [SocialKey, string] => !!entry[1]
  );

  if (entries.length === 0) return null;

  // The network's icon and the handle, never the raw URL; links are 44 px tall. The icon's name is for screen readers.
  return (
    <ul className="flex min-w-0 max-w-full flex-wrap justify-center gap-x-4">
      {entries.map(([key, value]) => {
        const Icon = SOCIAL_ICONS[key];
        const href = socialHref(value);
        const content = (
          <>
            <Icon className="size-5 shrink-0" />
            <span className="sr-only">{t(`player.socials.${key}`)}</span>
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

  // Every cell its own box, as the card draws them. Two wide beside the level from `xl`, unless the guild row's three
  // cells need the four columns. Columns never get narrower than their values, so the row takes its room from the
  // nametag rather than run values together.
  return (
    <div
      className={cn(
        "grid grid-cols-snap-2 sm:grid-cols-snap-4 max-sm:[&>:last-child:nth-child(odd)]:col-span-2",
        BOX_GAP,
        !overview.guildMember && "xl:grid-cols-snap-2",
        className
      )}
    >
      {cells.map(([label, value, color, link]) => (
        <StatBox key={label}>
          <StatCell
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
            className={cn("grow", link && "relative")}
          />
        </StatBox>
      ))}
    </div>
  );
}

/**
 * The guild, status and logins the card's header lists, and the session the bot's `/session` started, each in its own
 * box, two across from `sm`; an odd last one takes the row. The last game links to its page where the player has one
 * for it.
 */
function PlayerFacts({
  page: { uuid, guild, status, games, username, updatedAt, expiresAt, session },
  className,
}: {
  page: PlayerPage;
  className?: string;
}) {
  const { t } = useTranslation();
  const lastGame = status.lastGame && <MinecraftText>{status.lastGame.name}</MinecraftText>;
  const lastGamePage = games.find((game) => game.id === status.lastGame?.id)?.page;

  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 sm:max-xl:[&>:last-child:nth-child(odd)]:col-span-2", BOX_GAP, className)}>
      {guild && (
        <Fact>
          <InlineStat
            label={t("default:stats.guild.guild")}
            value={(
              <Link to="/{-$locale}/guild/$name" params={{ name: guild.name }} className={cn(STAT_LINK, "after:inset-0")}>
                {guild.name}
              </Link>
            )}
            color="text-mc-dark-green"
            large
          />
        </Fact>
      )}
      <Fact>
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
      </Fact>
      <Fact>
        <InlineStat label={t("default:stats.firstLogin")} value={<LoginDate ms={status.firstLogin} />} color="text-mc-dark-aqua" large />
      </Fact>
      <Fact>
        <InlineStat label={t("default:stats.lastLogin")} value={<LoginDate ms={status.lastLogin} />} color="text-mc-dark-aqua" large />
      </Fact>
      <Fact>
        <InlineStat label={t("default:stats.logoutTime")} value={<LoginDate ms={status.lastLogout} />} color="text-mc-dark-aqua" large />
      </Fact>
      <Fact>
        <InlineStat
          label={t("default:stats.lastGame")}
          value={lastGame && lastGamePage ?
            (
              // Over the whole box: the box, not the value's clip, holds its ::after.
              <Link to="/{-$locale}/player/$name/$game" params={{ name: username, game: lastGamePage }} className={cn(STAT_LINK, "after:inset-0")}>
                {lastGame}
              </Link>
            ) :
            (lastGame ?? t("player.na"))}
          large
        />
      </Fact>
      {session && (
        <Fact>
          <InlineStat
            label={t("session.title")}
            value={(
              <Link to="/{-$locale}/player/$name/session" params={{ name: username }} className={cn(STAT_LINK, "after:inset-0")}>
                <LoginDate ms={session.start} linked />
              </Link>
            )}
            color="text-mc-dark-aqua"
            large
          />
        </Fact>
      )}
    </div>
  );
}

/** A fact in its own box: the `<dl>` sits inside, since a `<dl>` can't hold the Box's wrappers. */
function Fact({ children }: { children: ReactNode }) {
  return (
    <Box className={CELL}>
      <dl className="min-w-0">{children}</dl>
    </Box>
  );
}

/**
 * "Online" while the save is fresh (until Refresh unlocks); after that, how long ago the save saw them online, with its
 * full date on hover, focus or tap. The HTML has the server's clock (when it fetched the page); `ClockScript` puts
 * the browser's in its place before first paint, so a cached page shows the right time from the start.
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
    <>
      <Hint full={date} spoken={date && `${online} · ${ago}, ${date}`}>
        {online}
        <span className="text-mc-gray" suppressHydrationWarning>{ago ? ` · ${ago}` : ""}</span>
      </Hint>
      <ClockScript args={{ updatedAt, expiresAt, locale: i18n.language }} />
    </>
  );
}

/** Hidden, where the player hides their online status in Hypixel's API settings, which the hint says. */
function HiddenStatus() {
  const { t } = useTranslation();
  const hidden = t("default:stats.hidden");
  const hint = t("player.statusHidden");

  return <Hint full={hint} spoken={`${hidden}. ${hint}`}>{hidden}</Hint>;
}

/** The games' panels; on a session's page, with the session's numbers and linking to its game pages. */
export function GameGrid({ games, username, session = false }: { games: GameSummary[]; username: string; session?: boolean }) {
  const { t } = useTranslation();

  if (games.length === 0) {
    return <p className="text-mc-1.5 text-mc-gray text-center">{t(session ? "session.noGames" : "player.noGames", { name: username })}</p>;
  }

  // Two 32 px cells side by side need about 300 px, so columns are added only when every panel keeps that width.
  return (
    <ul className={cn("grid grid-cols-1 md:grid-cols-snap-2 lg:grid-cols-snap-3 xl:grid-cols-snap-4", BOX_GAP)}>
      {games.map((game) => (
        <li key={game.id}>
          <GamePanel game={game} username={username} session={session} />
        </li>
      ))}
    </ul>
  );
}

/**
 * A game's title in a box linking to the game's page, over its headline numbers, each its own box linking to its
 * leaderboard at the player's row. A linked number shows its label's full name and exact number on hover and keyboard
 * focus, as on the game page; an unlinked one shows them on a tap too.
 */
function GamePanel({ game, username, session }: { game: GameSummary; username: string; session: boolean }) {
  const { t } = useTranslation();
  const n = useNumberFormat();
  const exact = useExactNumber();
  const statName = useStatName();
  const title = <MinecraftText className="text-mc-1.5">{`§l${game.name}${game.level ? `§r ${game.level}` : ""}`}</MinecraftText>;

  return (
    <div className={cn("grid grid-cols-snap-2 content-start", BOX_GAP)}>
      <Box className={HEADING_BOX}>
        <h2>
          {/* The whole box is the link, its ring on the box's edge: the box clips anything past it. */}
          <Link {...gameLink({ kind: session ? "session" : "player", name: username }, game.page)} className={cn(STAT_LINK, "after:inset-0")}>
            {title}
            {/* Text, not an icon, so the title's box keeps the height of every other panel's. */}
            <span aria-hidden className="text-mc-1.5 text-mc-gray"> »</span>
          </Link>
        </h2>
      </Box>
      {game.rows.map((row, index) => {
        const label = t(`stats.${row.key}`, { ns: LABEL_NAMESPACES });
        const full = statName(`stats.${row.key}`);
        const exactValue = typeof row.value === "number" ? exact(row.value) : undefined;
        // Under a link the link owns the tap and shows the full form; elsewhere the text does.
        const Short = row.leaderboard ? Spoken : Hint;
        // Text the API formatted takes the stat's colour, unless it brings its own (Layers' 74/100).
        const value = row.hidden ?
          <Hidden /> :
          typeof row.value === "number" ?
            <><Short full={exactValue}>{n(row.value)}</Short>{row.suffix}</> :
            <MinecraftText>{`${row.colour}${row.value}`}</MinecraftText>;
        const { className, style } = colourOf(row.colour);

        // An odd last box spans the row, centred, rather than leaving a hole beside it.
        return (
          <StatBox key={row.key} className={cn(index === game.rows.length - 1 && index % 2 === 0 && "col-span-2")}>
            <StatCell
              label={row.name === undefined ? <Short full={full}>{label}</Short> : <MinecraftText>{`${row.colour}${row.name}`}</MinecraftText>}
              value={row.leaderboard ?
                (
                  <LeaderboardLink field={row.leaderboard} username={username} stat={full ?? label} hint={linkHint(full, exactValue)}>
                    {value}
                  </LeaderboardLink>
                ) :
                value}
              color={className}
              style={style}
              className={cn("grow", row.leaderboard && "relative")}
            />
          </StatBox>
        );
      })}
    </div>
  );
}
