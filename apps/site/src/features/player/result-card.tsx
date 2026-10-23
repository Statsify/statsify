/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Box } from "~/components/ui/box";
import { Button } from "~/components/ui/button";
import { InlineStat } from "~/components/ui/stat";
import { Link } from "@tanstack/react-router";
import { MinecraftText } from "~/components/ui/minecraft-text";
import { SkinBust } from "~/components/ui/skin";
import { useNumberFormat } from "~/i18n/use-number-format";
import { useTranslation } from "react-i18next";
import type { ResultCard } from "@statsify/contract";

/** The `/player?q=` result grid: one column on phones, two from tablets up. */
export function ResultCards({ cards, query }: { cards: ResultCard[]; query: string }) {
  const { t } = useTranslation();

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4">
        <p className="text-mc-1.5 text-mc-gray text-center">{t("search.noResults", { query })}</p>
        {/* The player page looks an unknown name up on Hypixel. */}
        <Button asChild variant="primary" className="min-w-48">
          <Link to="/{-$locale}/player/$name" params={{ name: query }}>
            {t("search.lookup", { name: query })}
          </Link>
        </Button>
      </div>
    );
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

function ResultCardView({ card }: { card: ResultCard }) {
  const { t } = useTranslation();
  const n = useNumberFormat();

  return (
    <Link to="/{-$locale}/player/$name" params={{ name: card.username }} className="group block">
      <Box className="transition group-hover:brightness-110 content:flex content:items-center content:gap-4 content:p-3">
        <SkinBust uuid={card.uuid} className="h-24 w-16 shrink-0 sm:h-32 sm:w-20" />
        <div className="flex min-w-0 grow flex-col gap-2">
          {/* Rank, name and guild tag on one line, as on the card. */}
          <p className="truncate text-mc-1.5">
            <MinecraftText>{card.displayName}</MinecraftText>
            {card.guildTag && (
              <>
                {" "}
                <MinecraftText>{card.guildTag}</MinecraftText>
              </>
            )}
          </p>
          <dl className="flex flex-col gap-1">
            <InlineStat label={t("default:stats.achievementPoints")} value={n(card.achievementPoints)} color="text-mc-gold" />
            <InlineStat label={t("default:stats.quests")} value={n(card.quests)} color="text-mc-green" />
            <InlineStat label={t("default:stats.karma")} value={n(card.karma)} color="text-mc-pink" />
          </dl>
        </div>
      </Box>
    </Link>
  );
}
