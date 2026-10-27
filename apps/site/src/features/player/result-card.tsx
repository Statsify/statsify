/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { BOX_GAP, Box } from "~/components/ui/box";
import { Button } from "~/components/ui/button";
import { InlineStat } from "~/components/ui/stat";
import { Link } from "@tanstack/react-router";
import { MinecraftText } from "~/components/ui/minecraft-text";
import { SkinBust } from "~/components/ui/skin";
import { Spoken } from "~/components/ui/hint";
import { cn } from "~/lib/util";
import { rememberPlayer } from "./resolve";
import { searchState } from "~/components/search";
import { useEffect } from "react";
import { useExactNumber, useNumberFormat } from "~/i18n/use-number-format";
import { useQueryClient } from "@tanstack/react-query";
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
    <ul className={cn("w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3", BOX_GAP)}>
      {cards.map((card) => (
        <li key={card.uuid}>
          <ResultCardView card={card} />
        </li>
      ))}
    </ul>
  );
}

/** One player's card, linking to their page. */
export function ResultCardView({ card }: { card: ResultCard }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  // The card's player, so opening it is a single request.
  useEffect(() => rememberPlayer(queryClient, card), [card, queryClient]);
  const n = useNumberFormat();
  const exact = useExactNumber();
  // The card is a link, so a shortened number's exact one is for screen readers.
  const number = (value: number) => <Spoken full={exact(value)}>{n(value)}</Spoken>;

  return (
    // A column, so the box's foot margin stays inside the link and its ring clears the box's shadow.
    <Link to="/{-$locale}/player/$name" params={{ name: card.username }} state={searchState} className="group flex flex-col">
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
            <InlineStat label={t("default:stats.achievementPoints")} value={number(card.achievementPoints)} color="text-mc-gold" />
            <InlineStat label={t("default:stats.quests")} value={number(card.quests)} color="text-mc-green" />
            <InlineStat label={t("default:stats.karma")} value={number(card.karma)} color="text-mc-pink" />
          </dl>
        </div>
      </Box>
    </Link>
  );
}
