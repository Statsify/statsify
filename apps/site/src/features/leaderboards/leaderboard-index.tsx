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

  // Over 2,000 pills: plain anchors keep the index light, where a router Link each would preload on hover.
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
      <label className="flex h-12 items-center gap-3 self-center w-full max-w-200 bg-gradient-to-r from-white/20 to-white/40 px-4 outline-white/0 outline-4 -outline-offset-4 backdrop-blur-sm transition-all duration-150 focus-within:outline-white/50">
        <SearchIcon className="size-6 shrink-0" />
        <input
          type="search"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          placeholder={t("leaderboards.filter")}
          aria-label={t("leaderboards.filter")}
          className="h-full w-full bg-transparent text-mc-1 text-white outline-none placeholder-mc-darkgray selection:bg-white/50"
        />
      </label>
      {visible.length === 0 && (
        <p className="text-20 font-medium text-mc-gray text-center">{t("leaderboards.noMatches", { query: filter.trim() })}</p>
      )}
      {visible.map((group) => (
        <Box key={group.name}>
          <details open={filtering}>
            <summary className="inline-flex cursor-pointer items-center gap-3 text-mc-1.5 font-bold">
              {group.game && hasGameIcon(group.game) && <GameIcon game={group.game} />}
              {group.name}
            </summary>
            {/* One class on the list instead of one per link: there are thousands of them. */}
            <ul className="flex flex-wrap gap-2 pt-3 [&_a]:block [&_a]:bg-white/10 [&_a]:px-3 [&_a]:py-1.5 [&_a]:text-16 [&_a:hover]:bg-white/20">
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
