/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { BOX_GAP, Box, CELL } from "~/components/ui/box";
import { ResultCardView } from "./result-card";
import { cn } from "~/lib/util";
import { type RecentPlayer, clearPlayers, updatePlayer, useRecentPlayers } from "./recent";
import { orpc } from "~/lib/orpc";
import { resolveQuery } from "./resolve";
import { useEffect, useId } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import type { CSSProperties } from "react";

/** As the cards' edge cache. */
const STALE_MS = 60_000;

/**
 * `/player`'s recently viewed players, newest first, as result cards, with a Clear that empties the list (`onClear`
 * then moves focus to the search). Drawn after hydration from the browser's storage, in space held from first paint.
 * Each card loads by name on its own, the same request (and edge cache entry) as anyone's search for that name; a card
 * whose name no longer finds its player is asked for by UUID, and takes the new name or leaves the list.
 */
export function RecentPlayers({ onClear }: { onClear: () => void }) {
  const { t } = useTranslation();
  const headingId = useId();
  const recent = useRecentPlayers();
  const players = recent ?? [];

  return (
    <div className="recent-hold w-full" style={recent ? ({ "--recent": players.length } as CSSProperties) : undefined}>
      {players.length > 0 && (
        <section aria-labelledby={headingId} className={cn("flex flex-col", BOX_GAP)}>
          {/* The heading in a box over the cards, as a game page's are; Clear's ring sits inside, as the box clips. */}
          <Box className={cn(CELL, "content:justify-between content:gap-4 content:py-0")}>
            <h2 id={headingId} className="text-mc-1.5 font-bold">{t("search.recent.title")}</h2>
            <button
              type="button"
              onClick={() => {
                clearPlayers();
                onClear();
              }}
              className="min-h-11 min-w-11 text-end text-mc-1 text-mc-gray underline hover:text-mc-white focus-visible:focus-ring-inset"
            >
              {t("search.recent.clear")}
            </button>
          </Box>
          <ul className={cn("grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3", BOX_GAP)}>
            {players.map((player) => <RecentCard key={player.uuid} player={player} />)}
          </ul>
        </section>
      )}
    </div>
  );
}

/** One player's card, with a query of its own: `useQueries` would add 1.4 KB gzipped to the page for its observer. */
function RecentCard({ player: { uuid, name } }: { player: RecentPlayer }) {
  const cards = useQuery(orpc.search.cards.queryOptions({ input: { names: [name] }, staleTime: STALE_MS }));
  const card = cards.data?.find((card) => card.uuid === uuid);
  const resolved = useQuery({ ...resolveQuery(uuid), enabled: cards.isSuccess && !card });

  // A new name or a gone player rewrites the list once, and the next render finds nothing left to change.
  useEffect(() => {
    if (!resolved.isSuccess) return;
    if (resolved.data === null) updatePlayer(uuid, null);
    else if (resolved.data && resolved.data.username !== name) updatePlayer(uuid, resolved.data.username);
  }, [resolved.isSuccess, resolved.data, uuid, name]);

  return card && (
    <li>
      <ResultCardView card={card} />
    </li>
  );
}
