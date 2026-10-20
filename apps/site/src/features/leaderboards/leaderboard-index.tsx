/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Box } from "~/components/ui/box";
import { DEFAULT_LOCALE } from "~/i18n/locales";
import { GameIcon, hasGameIcon } from "~/components/ui/game-icon";
import { getRouteApi } from "@tanstack/react-router";
import { SearchIcon } from "~/components/icons/search";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { LeaderboardGroup } from "@statsify/contract";

const localeRoute = getRouteApi("/{-$locale}");

/** "BedWars - Wins" and "BedWars Wins" read "Wins" under their BedWars heading; the filter still sees the game. */
export function withoutGroupPrefix(groups: LeaderboardGroup[]): LeaderboardGroup[] {
  return groups.map((group) => ({
    ...group,
    leaderboards: group.leaderboards.map((leaderboard) => {
      const short = /^ ?-? (.+)$/.exec(leaderboard.name.slice(group.name.length));
      return leaderboard.name.startsWith(group.name) && short ? { ...leaderboard, name: short[1] } : leaderboard;
    }),
  }));
}

/**
 * Every leaderboard grouped by game, each group a closed `<details>` so the 2,700 links cost no layout until
 * opened. The filter matches every word of the query against "<game> <leaderboard>" and opens what's left.
 */
export function LeaderboardIndex({ groups }: { groups: LeaderboardGroup[] }) {
  const { t } = useTranslation();
  const { locale } = localeRoute.useRouteContext();

  // Over 2,000 links: plain anchors keep the index light, where a router Link each would preload on hover.
  const prefix = locale === DEFAULT_LOCALE ? "" : `/${locale}`;
  const href = (field: string) => `${prefix}/leaderboards/${encodeURIComponent(field)}`;
  const [filter, setFilter] = useState("");
  const words = filter.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const filtering = words.length > 0;

  const visible = groups
    .map((group) => {
      const game = group.name.toLowerCase();
      const leaderboards = group.leaderboards.filter(({ name }) => {
        const text = `${game} ${name.toLowerCase()}`;
        return words.every((word) => text.includes(word));
      });
      return { ...group, leaderboards };
    })
    .filter((group) => group.leaderboards.length > 0);

  return (
    <div className="flex flex-col gap-4">
      {/* The same square, solid input as the player search. */}
      <label className="flex h-11 w-full max-w-200 items-center gap-3 self-center bg-blackify-800 px-3 -outline-offset-2 focus-within:outline-2 focus-within:outline-white/60">
        <SearchIcon className="size-5 shrink-0 text-mc-gray" />
        <input
          type="search"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          placeholder={t("leaderboards.filter")}
          aria-label={t("leaderboards.filter")}
          className="h-full w-full min-w-0 bg-transparent text-mc-1.5 text-white text-ellipsis outline-none placeholder:text-mc-gray selection:bg-white/50"
        />
      </label>
      {visible.length === 0 && (
        <p className="text-mc-1.5 text-mc-gray text-center">{t("leaderboards.noMatches", { query: filter.trim() })}</p>
      )}
      {visible.map((group) => (
        <Box key={group.name} className="content:py-2">
          {/* One panel per game: a 44 px summary, then plain 44 px rows, one column on phones and up to four on
              desktop. */}
          <details open={filtering} className="group">
            <summary className="flex min-h-11 cursor-pointer list-none items-center gap-3 text-mc-1.5 font-bold select-none [&::-webkit-details-marker]:hidden">
              {group.game && hasGameIcon(group.game) && <GameIcon game={group.game} />}
              <span className="grow">{group.name}</span>
              <span className="text-mc-gray group-open:rotate-90">{">"}</span>
            </summary>
            {/* One class on the list instead of one per link: there are thousands of them. */}
            <ul className="grid grid-cols-1 pt-2 pb-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 [&_a]:flex [&_a]:min-h-11 [&_a]:items-center [&_a]:px-3 [&_a]:text-mc-1 [&_a:hover]:bg-white/10 [&_a:hover]:underline">
              {group.leaderboards.map(({ field, name }) => (
                <li key={field}>
                  <a href={href(field)}>{name}</a>
                </li>
              ))}
            </ul>
          </details>
        </Box>
      ))}
    </div>
  );
}
