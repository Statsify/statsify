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
import { GuildTag } from "./result-card";
import { MinecraftText } from "~/components/ui/minecraft-text";
import { RefreshBar } from "./refresh-bar";
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
import type { ComponentType, ReactNode } from "react";
import type { GameSummary, PlayerPage } from "@statsify/contract";

type Socials = PlayerPage["socials"];
type SocialKey = keyof Socials;

const SOCIAL_ICONS: Partial<Record<SocialKey, ComponentType<{ className?: string }>>> = {
  discord: Discord,
  twitter: Twitter,
  youtube: YouTube,
};

// Labels are Mona Sans; names, dates and numbers stay Minecraft at 16 px on phones.
const LABEL = "font-sans text-16 font-medium text-mc-gray";
const VALUE = "text-mc-1";

/** The player page: profile, network level and login panels, then one panel per game. */
export function PlayerView({ page }: { page: PlayerPage }) {
  const queryClient = useQueryClient();

  // The refreshed page replaces the cached query, so every panel re-renders with the new numbers. The player's game
  // pages predate the refresh: they reload the next time they're shown.
  const refresh = async (token: string | undefined) => {
    const result = await refreshPlayer({ data: { uuid: page.uuid, token } });

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
          <ProfilePanel page={page} className="lg:row-span-2" />
          <NetworkLevelPanel level={page.level} />
          <LoginPanel status={page.status} />
        </div>
        <RefreshBar updatedAt={page.updatedAt} expiresAt={page.expiresAt} refresh={refresh} />
        <GameGrid games={page.games} />
      </div>
    </div>
  );
}

function ProfilePanel({ page, className }: { page: PlayerPage; className?: string }) {
  const { t } = useTranslation();
  const n = useNumberFormat();
  const { overview } = page;

  const rows: [label: string, value: number, color: string][] = [
    [t("default:stats.achievementPoints"), overview.achievementPoints, "text-mc-gold"],
    [t("default:stats.karma"), overview.karma, "text-mc-pink"],
    [t("default:stats.quests"), overview.quests, "text-mc-green"],
    [t("default:stats.challenges"), overview.challenges, "text-mc-green"],
    [t("default:stats.rewardStreak"), overview.currentRewardStreak, "text-mc-pink"],
    [t("player.highestStreak"), overview.highestRewardStreak, "text-mc-pink"],
    [t("default:stats.giftsSent"), overview.giftsSent, "text-mc-dark-purple"],
    [t("default:stats.ranksGifted"), overview.ranksGifted, "text-mc-dark-purple"],
  ];

  return (
    <Box className={cn("content:grid content:grid-cols-[auto_1fr] content:gap-x-4 content:gap-y-3", className)}>
      <SkinBust uuid={page.uuid} className="h-24 w-16 sm:row-span-2 sm:h-40 sm:w-28" />
      <div className="flex min-w-0 flex-col gap-2 self-center">
        <MinecraftText className="text-mc-1.5 sm:text-mc-2">{page.displayName}</MinecraftText>
        {page.guild && (
          <p className={cn(LABEL, "flex flex-wrap items-center gap-2")}>
            {t("default:stats.guild.guild")}:
            {page.guild.tagFormatted ? <GuildTag tag={page.guild.tagFormatted} /> : null}
            <span className="text-mc-white">{page.guild.name}</span>
          </p>
        )}
      </div>
      {/* Phones: two columns under the skin and name; wider screens: beside the skin. */}
      <dl className="col-span-2 grid grid-cols-2 gap-x-4 gap-y-1 sm:col-span-1 sm:col-start-2">
        {rows.map(([label, value, color]) => (
          <div key={label} className="flex items-baseline justify-between gap-2 sm:justify-start">
            <dt className={cn(LABEL, "font-narrow sm:font-stretch-normal")}>{label}</dt>
            <dd className={cn(VALUE, color)}>{n(value)}</dd>
          </div>
        ))}
      </dl>
      <SocialLinks socials={page.socials} className="col-span-2" />
    </Box>
  );
}

function socialHref(value: string): string | undefined {
  if (/^https?:\/\//i.test(value)) return value;
  if (/^[\w.-]+\.[a-z]{2,}(?:\/|$)/i.test(value)) return `https://${value}`;
  return undefined;
}

function SocialLinks({ socials, className }: { socials: Socials; className?: string }) {
  const entries = (Object.entries(socials) as [SocialKey, string | undefined][]).filter(
    (entry): entry is [SocialKey, string] => !!entry[1]
  );

  if (entries.length === 0) return null;

  return (
    <ul className={cn("flex flex-wrap gap-x-4 gap-y-2 text-16 font-medium", className)}>
      {entries.map(([key, value]) => {
        const Icon = SOCIAL_ICONS[key];
        const href = socialHref(value);
        const content = (
          <>
            {Icon ? <Icon className="size-5 shrink-0" /> : <span className="text-mc-gray capitalize">{key}</span>}
            <span className="max-w-56 truncate">{value}</span>
          </>
        );

        return (
          <li key={key}>
            {href ?
              (
                <a href={href} target="_blank" rel="noreferrer noopener" className="flex items-center gap-2 hover:underline">
                  {content}
                </a>
              ) :
              (
                <span className="flex items-center gap-2">{content}</span>
              )}
          </li>
        );
      })}
    </ul>
  );
}

function NetworkLevelPanel({ level }: { level: PlayerPage["level"] }) {
  const { t } = useTranslation();
  const n = useNumberFormat();
  const current = Math.floor(level.level);

  return (
    <Box className="content:flex content:flex-col content:justify-center content:gap-2">
      <div className={cn(LABEL, "flex flex-wrap items-baseline justify-between gap-x-4")}>
        <p>
          {t("default:stats.networkLevel")}: <span className={cn(VALUE, "text-mc-gold lg:text-mc-1.5")}>{n(level.level)}</span>
        </p>
        <p>
          {t("player.multiplier")}: <span className={cn(VALUE, "text-mc-gold lg:text-mc-1.5")}>x{n(level.multiplier)}</span>
        </p>
      </div>
      <p className={LABEL}>
        {t("default:stats.exp")}: <span className={cn(VALUE, "text-mc-aqua")}>{n(level.current)}</span>
        <span className={VALUE}>/</span>
        <span className={cn(VALUE, "text-mc-green")}>{n(level.max)}</span>
      </p>
      <MinecraftText className={cn(VALUE, "lg:text-mc-1.5")}>
        {`§6${current} ${minigameXpBar(level.percent)} §6${current + 1}`}
      </MinecraftText>
    </Box>
  );
}

function LoginPanel({ status }: { status: PlayerPage["status"] }) {
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
    <Box className="content:grid content:grid-cols-2 content:gap-x-4 content:gap-y-2">
      <Field label={t("default:stats.firstLogin")} value={date(status.firstLogin)} color="text-mc-dark-aqua" />
      <Field label={t("default:stats.lastLogin")} value={date(status.lastLogin)} color="text-mc-dark-aqua" />
      <Field
        label={t("default:stats.status")}
        value={status.online ? t("default:stats.online") : t("default:stats.offline")}
        color={status.online ? "text-mc-green" : "text-mc-red"}
      />
      <Field
        label={t("default:stats.lastGame")}
        value={status.lastGame ? <MinecraftText className={VALUE}>{status.lastGame.name}</MinecraftText> : t("player.na")}
      />
    </Box>
  );
}

function Field({ label, value, color }: { label: string; value: ReactNode; color?: string }) {
  return (
    <div className="flex min-w-0 flex-col">
      <span className={cn(LABEL, "font-narrow sm:font-stretch-normal")}>{label}</span>
      <span className={cn(VALUE, color)}>{value}</span>
    </div>
  );
}

function GameGrid({ games }: { games: GameSummary[] }) {
  return (
    <ul className="grid grid-cols-1 gap-2 min-[480px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {games.map((game) => (
        <li key={game.id}>
          <GamePanel game={game} />
        </li>
      ))}
    </ul>
  );
}

function GamePanel({ game }: { game: GameSummary }) {
  const { t } = useTranslation();
  const n = useNumberFormat();

  return (
    <Box
      className="h-full content:flex content:flex-col content:gap-1"
      title={
        <MinecraftText className={cn(VALUE, "lg:text-mc-1.5")}>
          {`§l${game.name}${game.level ? `§r ${game.level}` : ""}`}
        </MinecraftText>
      }
    >
      {game.rows.map((row) => (
        <div key={row.key} className="flex items-baseline justify-between gap-2">
          <span className={cn(LABEL, "font-narrow sm:font-stretch-normal")}>{t(`default:stats.${row.key}`)}</span>
          {typeof row.value === "number" ?
            <span className={VALUE}>{n(row.value)}</span> :
            <MinecraftText className={VALUE}>{row.value}</MinecraftText>}
        </div>
      ))}
    </Box>
  );
}
