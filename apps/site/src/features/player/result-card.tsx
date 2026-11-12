/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Box } from "~/components/ui/box";
import { Link } from "@tanstack/react-router";
import { MinecraftText } from "~/components/ui/minecraft-text";
import { SkinBust } from "~/components/ui/skin";
import { cn } from "~/lib/util";
import { useNumberFormat } from "~/i18n/use-number-format";
import { useTranslation } from "react-i18next";
import type { ResultCard } from "@statsify/contract";

/** The `/player?q=` result grid: one column on phones, two from tablets up. */
export function ResultCards({ cards, query }: { cards: ResultCard[]; query: string }) {
  const { t } = useTranslation();

  if (cards.length === 0) {
    return <p className="text-20 font-medium text-mc-gray text-center">{t("search.noResults", { query })}</p>;
  }

  return (
    <ul className="w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
      {cards.map((card) => (
        <li key={card.uuid}>
          <ResultCardView card={card} />
        </li>
      ))}
    </ul>
  );
}

/** The Minecraft-formatted guild tag as a pill next to the name. */
export function GuildTag({ tag, className }: { tag: string; className?: string }) {
  return (
    <span className={cn("rounded-xs bg-black/30 px-2 py-0.5", className)}>
      <MinecraftText className="text-mc-1">{tag}</MinecraftText>
    </span>
  );
}

function ResultCardView({ card }: { card: ResultCard }) {
  const { t } = useTranslation();
  const n = useNumberFormat();

  return (
    <Link to="/{-$locale}/player/$name" params={{ name: card.username }} className="group block">
      <Box className="transition group-hover:brightness-110 content:flex content:items-center content:gap-4 content:p-3">
        <SkinBust uuid={card.uuid} className="h-24 w-16 shrink-0 sm:h-32 sm:w-20" />
        <div className="flex min-w-0 grow flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <MinecraftText className="text-mc-1 sm:text-mc-1.5">{card.displayName}</MinecraftText>
            {card.guildTag && <GuildTag tag={card.guildTag} />}
          </div>
          <dl className="grid grid-cols-3 gap-2 text-16 font-medium sm:grid-cols-1 sm:gap-1">
            <CardStat label={t("default:stats.achievementPoints")} value={n(card.achievementPoints)} color="text-mc-gold" />
            <CardStat label={t("default:stats.quests")} value={n(card.quests)} color="text-mc-green" />
            <CardStat label={t("default:stats.karma")} value={n(card.karma)} color="text-mc-pink" />
          </dl>
        </div>
      </Box>
    </Link>
  );
}

// Phones stack the label over the value in three columns; wider screens show label: value rows.
function CardStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex min-w-0 flex-col sm:flex-row sm:items-baseline sm:gap-2">
      <dt className="truncate text-mc-gray font-narrow sm:font-stretch-normal">{label}</dt>
      <dd className={cn("text-mc-1", color)}>{value}</dd>
    </div>
  );
}
