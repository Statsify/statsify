/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Box } from "~/components/ui/box";
import { DEFAULT_LOCALE } from "~/i18n/locales";
import { FilterBox, wordMatcher } from "~/components/filter-box";
import { GameIcon, hasGameIcon } from "~/components/ui/game-icon";
import { getRouteApi, useRouter } from "@tanstack/react-router";
import { type MouseEvent, type SyntheticEvent, useRef, useState } from "react";
import { useNumberFormat } from "~/i18n/use-number-format";
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

/** One panel of an index: a game's leaderboards on `/leaderboards`, or a mode's on a game's index. */
export type IndexGroup = Pick<LeaderboardGroup, "key" | "game" | "name" | "leaderboards">;

const boardCount = (groups: IndexGroup[]) => groups.reduce((sum, group) => sum + group.leaderboards.length, 0);

/**
 * Leaderboards in groups (every leaderboard by game, or one game's by mode), each group a closed `<details>` so the
 * 2,700 links cost no layout until opened, except the `open` one. Each group's id is its key, so `#<key>` lands on it.
 * With `gameIndexes`, each game's panel starts with a link to its own index. The filter matches every word of the query
 * against "<group> <leaderboard>" and opens what's left.
 */
export function LeaderboardIndex({
  groups,
  open,
  gameIndexes = false,
}: {
  groups: IndexGroup[];
  open?: string;
  gameIndexes?: boolean;
}) {
  const { t } = useTranslation();
  const n = useNumberFormat();
  const { locale } = localeRoute.useRouteContext();

  // Over 2,000 links: plain anchors keep the index light, where a router Link each would cost a component and its
  // listeners. One set of handlers on each list does a Link's job instead (see `useLinkDelegation`).
  const prefix = locale === DEFAULT_LOCALE ? "" : `/${locale}`;
  const href = (field: string) => `${prefix}/leaderboards/${encodeURIComponent(field)}`;
  const delegation = useLinkDelegation(locale === DEFAULT_LOCALE ? undefined : locale);
  const [filter, setFilter] = useState("");
  const matches = wordMatcher(filter);
  const filtering = filter.trim() !== "";

  const visible = groups
    .map((group) => ({ ...group, leaderboards: group.leaderboards.filter(({ name }) => matches(`${group.name} ${name}`)) }))
    .filter((group) => group.leaderboards.length > 0);

  return (
    <div className="flex flex-col gap-4">
      <FilterBox
        value={filter}
        onChange={setFilter}
        label={t("leaderboards.filter")}
        count={t("filter.count", { shown: n(boardCount(visible)), total: n(boardCount(groups)) })}
        className="max-w-200 self-center"
      />
      {visible.length === 0 && (
        <p className="text-mc-1.5 text-mc-gray text-center">{t("leaderboards.noMatches", { query: filter.trim() })}</p>
      )}
      {visible.map((group) => (
        <Box key={group.key} className="content:py-2">
          {/* One panel per group: a 44 px summary, then plain 44 px rows, one column on phones and up to four on
              desktop. */}
          <details open={filtering || group.key === open} id={group.key || undefined} className="group scroll-mt-4">
            <summary className="flex min-h-11 cursor-pointer list-none items-center gap-3 text-mc-1.5 font-bold select-none [&::-webkit-details-marker]:hidden">
              {group.game && hasGameIcon(group.game) && <GameIcon game={group.game} />}
              <span className="grow">{group.name}</span>
              <span className="text-mc-gray group-open:rotate-90">{">"}</span>
            </summary>
            {/* One class on the list instead of one per link: there are thousands of them. */}
            <ul {...delegation} className="grid grid-cols-1 pt-2 pb-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 [&_a]:flex [&_a]:min-h-11 [&_a]:items-center [&_a]:px-3 [&_a]:text-mc-1 [&_a:hover]:bg-white/10 [&_a:hover]:underline">
              {gameIndexes && !filtering && (
                <li className="col-span-full">
                  {/* The game's index is `/leaderboards/<key>`, the same route as a leaderboard's. */}
                  <a href={href(group.key)} data-field={group.key} className="text-mc-yellow">
                    {t("leaderboards.gameTitle", { game: group.name })}
                  </a>
                </li>
              )}
              {group.leaderboards.map(({ field, name }) => (
                <li key={field}>
                  <a href={href(field)} data-field={field}>{name}</a>
                </li>
              ))}
            </ul>
          </details>
        </Box>
      ))}
    </div>
  );
}

/** Matches a router Link's intent delay, so sweeping the pointer across the list doesn't preload every row. */
const PRELOAD_DELAY_MS = 50;

/**
 * What a router Link does, for a list of plain `<a data-field>` leaderboard links: hovering, focusing or touching one
 * preloads its leaderboard, and a plain left click (or Enter) navigates in the app, so the index stays on screen until
 * the leaderboard's data is ready. Modified clicks fall through to the browser (new tab, new window).
 */
function useLinkDelegation(locale: string | undefined) {
  const router = useRouter();
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const options = (event: SyntheticEvent) => {
    const anchor = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[data-field]") : null;
    const field = anchor?.dataset.field;
    return field ? ({ to: "/{-$locale}/leaderboards/$field", params: { locale, field } } as const) : undefined;
  };

  const preload = (event: SyntheticEvent) => {
    const target = options(event);
    if (target) void router.preloadRoute(target);
  };

  return {
    onFocus: preload,
    onTouchStart: preload,
    onMouseOver: (event: MouseEvent) => {
      clearTimeout(timer.current);
      timer.current = setTimeout(() => preload(event), PRELOAD_DELAY_MS);
    },
    onMouseOut: () => clearTimeout(timer.current),
    onClick: (event: MouseEvent) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = options(event);
      if (!target) return;
      event.preventDefault();
      void router.navigate(target);
    },
  };
}
