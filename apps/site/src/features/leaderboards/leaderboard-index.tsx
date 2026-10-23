/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Box } from "~/components/ui/box";
import { Chevron } from "~/components/icons/chevron";
import { DEFAULT_LOCALE } from "~/i18n/locales";
import { FilterBox } from "~/components/filter-box";
import { GameIcon, hasGameIcon } from "~/components/ui/game-icon";
import { type GroupSummary, type ListGroup, boardLinksHtml, fetchLeaderboardList, filterGroups } from "./leaderboard-list";
import { type MouseEvent, type ReactNode, type SyntheticEvent, useMemo, useRef, useState } from "react";
import { builtLeaderboardList } from "~/server/leaderboard-list.server";
import { createIsomorphicFn } from "@tanstack/react-start";
import { getRouteApi, useHydrated, useRouter } from "@tanstack/react-router";
import { useNumberFormat } from "~/i18n/use-number-format";
import { useTranslation } from "react-i18next";
import type { IndexData } from "./leaderboard-data";

const localeRoute = getRouteApi("/{-$locale}");

// One class on each list instead of one per link: there are thousands of them.
const LIST =
  "grid grid-cols-1 pt-2 pb-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 [&_a]:flex [&_a]:min-h-11 [&_a]:items-center [&_a]:px-3 [&_a]:text-mc-1 [&_a:hover]:bg-white/10 [&_a:hover]:underline";

const boardHref = (prefix: string, field: string) => `${prefix}/leaderboards/${encodeURIComponent(field)}`;

/** The page's locale prefix for links, and the handlers that make plain leaderboard links act like router links. */
function useBoardLinks() {
  const { locale } = localeRoute.useRouteContext();
  const prefix = locale === DEFAULT_LOCALE ? "" : `/${locale}`;
  return { prefix, delegation: useLinkDelegation(locale === DEFAULT_LOCALE ? undefined : locale) };
}

/**
 * One group's panel: a 44 px summary, then its links in plain 44 px rows, one column on phones and up to four on desktop.
 * With `icons`, every summary keeps a slot for its game's icon, so the names line up whether a group has one or not.
 */
function IndexPanel({ group, open, icons, children }: { group: Omit<GroupSummary, "count">; open: boolean; icons?: boolean; children: ReactNode }) {
  return (
    <Box className="content:py-2">
      {/* The group's id is its key, so `#<key>` lands on it. */}
      <details open={open} id={group.key || undefined} className="group scroll-mt-4">
        <summary className="flex min-h-11 cursor-pointer list-none items-center gap-3 text-mc-1.5 font-bold select-none [&::-webkit-details-marker]:hidden">
          {icons && (
            <span aria-hidden className="size-8 shrink-0">
              {group.game && hasGameIcon(group.game) && <GameIcon game={group.game} />}
            </span>
          )}
          <span className="grow">{group.name}</span>
          <Chevron className="size-6 shrink-0 text-mc-gray transition-transform group-open:rotate-90" />
        </summary>
        {children}
      </details>
    </Box>
  );
}

/** The filter's list didn't load; pressing the box again tries again. */
function ListFailed() {
  const { t } = useTranslation();
  return <p className="text-mc-1 text-mc-yellow text-center">{t("leaderboards.listFailed")}</p>;
}

function NoMatches({ query }: { query: string }) {
  const { t } = useTranslation();
  return <p className="text-mc-1.5 text-mc-gray text-center">{t("leaderboards.noMatches", { query: query.trim() })}</p>;
}

const boardCount = (groups: ListGroup[]) => groups.reduce((sum, group) => sum + group.leaderboards.length, 0);

/**
 * One game's leaderboards by mode, with the list in the page's data (a few hundred links at most). Each group is a
 * closed `<details>` except the `open` one. The filter matches as `/leaderboards`' does and opens what's left.
 */
export function LeaderboardIndex({ groups, open }: { groups: ListGroup[]; open?: string }) {
  const { t } = useTranslation();
  const n = useNumberFormat();
  const { prefix, delegation } = useBoardLinks();
  const [filter, setFilter] = useState("");
  const filtering = filter.trim() !== "";
  const visible = filtering ? filterGroups(groups, filter) : groups;

  return (
    <div className="flex flex-col gap-4">
      <FilterBox
        value={filter}
        onChange={setFilter}
        label={t("leaderboards.filter")}
        count={t("filter.count", { shown: n(boardCount(visible)), total: n(boardCount(groups)) })}
        className="max-w-200 self-center"
      />
      {filtering && visible.length === 0 && <NoMatches query={filter} />}
      {visible.map((group) => (
        <IndexPanel key={group.key} group={group} open={filtering || group.key === open}>
          <ul {...delegation} className={LIST}>
            {group.leaderboards.map(({ field, name }) => (
              <li key={field}>
                <a href={boardHref(prefix, field)} data-field={field}>{name}</a>
              </li>
            ))}
          </ul>
        </IndexPanel>
      ))}
    </div>
  );
}

/** The server's copy of the list, for its render of `/leaderboards`. The browser has none until it fetches the list. */
const serverList = createIsomorphicFn()
  .server(() => builtLeaderboardList())
  .client((): ListGroup[] | undefined => undefined);

/**
 * Every leaderboard grouped by game, each group a closed `<details>` so the 2,700 links cost no layout until opened, each
 * with a link to its game's index first.
 *
 * The list isn't in the page's data: the server renders the links into the HTML and hydration keeps them as they are.
 * The filter fetches the list (one file, cached for good under its hash) when the box is first pressed or focused, then
 * matches every word of the query against "<game> <leaderboard>", abbreviations ("bw fk") and the stat's word on the
 * bot's cards, and opens what's left. Without scripts the box submits `?q=`, which the server filters the same way.
 * A client-side visit brings the list along (`list`).
 */
export function AllLeaderboards({ data, list: loaded, query = "" }: { data: IndexData; list?: ListGroup[]; query?: string }) {
  const { t } = useTranslation();
  const n = useNumberFormat();
  const { prefix, delegation } = useBoardLinks();
  const [list, setList] = useState(() => loaded ?? serverList());
  const [failed, setFailed] = useState(false);
  const [filter, setFilter] = useState(query);

  const loadList = () => {
    if (list) return;
    setFailed(false);
    fetchLeaderboardList(data.hash).then(setList, () => setFailed(true));
  };

  // Until the list is here, the server's render stands, for the query it rendered.
  const rendered = list ? filter : query;
  const filtering = rendered.trim() !== "";

  const shown = useMemo(() => {
    if (!list) return (data.matches ?? data.groups).map((group) => ({ group, html: undefined }));

    return (filtering ? filterGroups(list, rendered) : list).map(({ leaderboards, ...group }) => ({
      group: { ...group, count: leaderboards.length },
      html: boardLinksHtml(leaderboards, (field) => boardHref(prefix, field)),
    }));
  }, [list, rendered, filtering, data, prefix]);

  const total = data.groups.reduce((sum, { count }) => sum + count, 0);
  const matched = shown.reduce((sum, { group }) => sum + group.count, 0);
  const waiting = !list && filter.trim() !== query.trim();
  // A failed load says so under the box: in the box's count it would crowd out what was typed on a phone.
  const count =
    failed ? undefined :
    waiting ? t("leaderboards.loading") :
    t("filter.count", { shown: n(matched), total: n(total) });

  return (
    <div className="flex flex-col gap-4">
      {/* With scripts the box filters as you type; without, it submits `?q=` with the Go button. */}
      <form
        method="get"
        action={`${prefix}/leaderboards`}
        onSubmit={(event) => event.preventDefault()}
        className="flex w-full max-w-200 gap-2 self-center"
      >
        <FilterBox
          value={filter}
          onChange={(value) => {
            setFilter(value);
            loadList();
          }}
          onIntent={loadList}
          name="q"
          label={t("leaderboards.filter")}
          count={count}
        />
        <noscript>
          <button
            type="submit"
            className="h-11 shrink-0 bg-blackify-800 px-3 text-mc-1.5 text-white -outline-offset-2 hover:bg-blackify-700 focus-visible:outline-2 focus-visible:outline-white/60"
          >
            {t("game.go")}
          </button>
        </noscript>
      </form>
      {failed && <ListFailed />}
      {filtering && shown.length === 0 && <NoMatches query={rendered} />}
      {shown.map(({ group, html }) => (
        <IndexPanel key={group.key} group={group} open={filtering} icons>
          <div {...delegation}>
            {!filtering && (
              <a
                href={boardHref(prefix, group.key)}
                data-field={group.key}
                className="flex min-h-11 items-center px-3 pt-2 text-mc-1 text-mc-yellow hover:bg-white/10 hover:underline"
              >
                {t("leaderboards.gameTitle", { game: group.name })}
              </a>
            )}
            <BoardLinks id={`boards-${group.key}`} html={html} />
          </div>
        </IndexPanel>
      ))}
    </div>
  );
}

/**
 * A group's links as markup, set as HTML rather than one element each. Without the list (hydrating the server's render,
 * or before the first fetch), the server's markup is kept as it is: read back from the page while hydrating, so it
 * matches and React leaves it alone.
 */
function BoardLinks({ id, html }: { id: string; html?: string }) {
  const hydrated = useHydrated();
  const [server] = useState(() =>
    html === undefined && !hydrated && typeof document !== "undefined" ? (document.querySelector(`#${id}`)?.innerHTML ?? "") : ""
  );

  return <ul id={id} className={LIST} dangerouslySetInnerHTML={{ __html: html ?? server }} />;
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
