/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

/* eslint-disable jsx-a11y/no-redundant-roles, jsx-a11y/prefer-tag-over-role -- the APG combobox: the input needs
   role="combobox", and the suggestions are a styled listbox of links, which <datalist> can't be. */

import { Link, useHydrated, useNavigate, useRouterState } from "@tanstack/react-router";
import { SearchIcon } from "~/components/icons/search";
import { SkinHead } from "~/components/ui/skin";
import { cn } from "~/lib/util";
import { orpc } from "~/lib/orpc";
import { useDebounce } from "~/hooks/use-debounce";
import { useRecentPlayers } from "~/features/player/recent";
import { useOutsideClick } from "~/hooks/use-outside-click";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useEffect, useEffectEvent, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

const SEARCH_DEBOUNCE_MS = 300;
const SEARCH_CACHE_TIME_MS = 5 * 60 * 1000;
/** Safari ignores `replaceState` past 100 calls in 30 seconds, so a draft is saved once typing pauses. */
const DRAFT_DEBOUNCE_MS = 500;

/**
 * The search's text in the tab's history entry, for a reload, Back and Forward, with no history entry per keystroke.
 * Past TanStack's patched `replaceState`, which would run a navigation.
 */
function saveDraft(draft: string | undefined) {
  History.prototype.replaceState.call(history, { ...history.state, searchDraft: draft }, "");
}

const savedDraft = () => history.state?.searchDraft as string | undefined;

/** Before React hydrates: `__searchDraft(form)` puts a reloaded entry's draft in the box as its HTML is parsed. */
export const SEARCH_SCRIPT = `window.__searchDraft = (form) => {
  const draft = history.state?.searchDraft;
  if (draft !== undefined) form.querySelector("input").value = draft;
};`;

/**
 * Where a submitted name goes: the player page, its Bingo boards, the `/player?q=` result cards, or a game page with
 * its mode, submode and period (the header's search on a game page, to compare the same page).
 */
export type SearchTarget = "player" | "bingo" | "results" | GameTarget;

interface GameTarget {
  game: string;
  search: { mode?: string; submode?: string; period?: string };
}

// Rows are at least 44 px tall, an easy tap target; `item` must match `itemHeight` for the keyboard scrolling. The
// sheet is 300 px tall from `sm`, and a row shorter on phones, so the on-screen keyboard doesn't cover its last name.
// `rows` is how many rows the 300 px sheet can show at once, counting one cut off at each edge. Heads are a whole
// multiple of the 8×8 face, so its pixels stay square.
const SIZES = {
  regular: {
    itemHeight: 56,
    rows: 7,
    item: "h-14 px-4",
    bar: "h-16 px-4 gap-4",
    icon: "size-8",
    head: 32,
    headSlot: "size-8",
    text: "text-mc-2",
    sheet: "max-h-61 sm:max-h-75",
  },
  compact: {
    itemHeight: 44,
    rows: 8,
    item: "h-11 px-3",
    bar: "h-11 px-3 gap-3",
    icon: "size-5",
    head: 24,
    headSlot: "size-6",
    text: "text-mc-1.5",
    sheet: "max-h-64 sm:max-h-75",
  },
} as const;

/** `skipEmpty`: an empty box asks for nothing (the API suggests nothing for it), as one that lists recent players. */
function usePlayerSuggestions(input: string, focused: boolean, skipEmpty: boolean) {
  const debouncedInput = useDebounce(input, SEARCH_DEBOUNCE_MS);
  const length = debouncedInput.trim().length;

  // Through the edge-cached `/api/rpc` proxy; the API answers from RediSearch alone. While the next query loads,
  // the last suggestions stay up, so the sheet never empties between keystrokes.
  return useQuery(
    orpc.search.suggest.queryOptions({
      input: { query: debouncedInput },
      // A pasted UUID is longer than any name, and the API refuses it.
      enabled: focused && length <= 16 && !(skipEmpty && length === 0),
      retry: false,
      gcTime: SEARCH_CACHE_TIME_MS,
      placeholderData: keepPreviousData,
    })
  );
}

/**
 * The history state of a page the search opens: its player updates as for a bot command (`RefreshBar`). Not in the
 * URL, so a shared link doesn't.
 */
export const searchState = () => ({ searchedAt: Date.now() });

function useSearchNavigation(target: SearchTarget) {
  const navigate = useNavigate();

  return (name: string) => {
    if (typeof target === "object") {
      return navigate({ to: "/{-$locale}/player/$name/$game", params: { name, game: target.game }, search: target.search, state: searchState });
    }

    switch (target) {
      case "bingo":
        return navigate({ to: "/{-$locale}/player/$name/bingo", params: { name }, state: searchState });
      case "results":
        return navigate({ to: "/{-$locale}/player", search: { q: name }, state: searchState });
      case "player":
        return navigate({ to: "/{-$locale}/player/$name", params: { name }, state: searchState });
    }
  };
}

/** A key pressed into a field or an editable element, or with a modifier held, is someone typing, not a shortcut. */
const typing = (event: KeyboardEvent) =>
  event.isComposing ||
  event.ctrlKey ||
  event.metaKey ||
  event.altKey ||
  (event.target instanceof HTMLElement && (event.target.isContentEditable || event.target.matches("input, textarea, select")));

export function Search({
  className,
  defaultValue,
  disabled,
  target = "player",
  compact = false,
  shortcut = false,
  recent = false,
  placeholder,
  onSelect,
}: {
  className?: string;
  /** The page's own text for the box (`?q=`, a board's player), which it shows again on another page without a draft. */
  defaultValue?: string;
  disabled?: boolean;
  target?: SearchTarget;
  compact?: boolean;
  /** "/" focuses this box: the page's one player search (the header's, or the page's own where the header has none). */
  shortcut?: boolean;
  /** Until something is typed, the sheet lists the players this device viewed last (`/player` shows them as cards). */
  recent?: boolean;
  placeholder?: string;
  /** Handles a submitted or picked name instead of navigating to `target`. */
  onSelect?: (name: string) => unknown;
}) {
  const { t } = useTranslation();
  const size = SIZES[compact ? "compact" : "regular"];
  // A box with its own placeholder (a leaderboard's "find a player") is named by it, apart from the site's search.
  const label = placeholder ?? t("search.label");
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const inputId = `${listId}-input`;
  // The site's player search keeps a draft; a box with its own handler (a leaderboard's) doesn't.
  const drafts = !onSelect;
  const hydrated = useHydrated();
  // While hydrating, the box as it is: text typed before React took over, or a reloaded draft (`SEARCH_SCRIPT`).
  const [initial] = useState(() => {
    if (typeof document === "undefined") return { value: defaultValue ?? "", focused: false };
    const element = hydrated ? null : document.querySelector<HTMLInputElement>(`#${CSS.escape(inputId)}`);
    if (element) return { value: element.value, focused: element === document.activeElement };
    return { value: (drafts ? savedDraft() : undefined) ?? defaultValue ?? "", focused: false };
  });
  const [input, setInput] = useState(initial.value);
  const [query, setQuery] = useState(initial.value);
  const [focused, setFocused] = useState(initial.focused);
  const suggestions = usePlayerSuggestions(query, focused, recent);
  const recentPlayers = useRecentPlayers();
  // `query` is the typed text; the arrows put a row's name in the box without leaving the recent players.
  const names = recent && query.trim() === "" ? recentPlayers?.map((player) => player.name) : suggestions.data;
  const [selected, setSelected] = useState<number | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigateTo = useSearchNavigation(target);
  const go = onSelect ?? navigateTo;
  const optionId = (index: number) => `${listId}-${index}`;
  const count = names?.length ?? 0;
  const open = focused && count > 0;
  // Heads load for the rows in view, not all 25: each one is a request, and the edge allows a visitor 60 in 10 seconds.
  const [firstRow, setFirstRow] = useState(0);

  // Another history entry brings its draft, or else the page's text; the header's box keeps its text from page to page.
  // The entry once its page has rendered, so `defaultValue` is that page's.
  // eslint-disable-next-line no-underscore-dangle -- the history entry's key, under TanStack's name
  const entry = useRouterState({ select: ({ resolvedLocation }) => resolvedLocation?.state.__TSR_key });
  const shownEntry = useRef(entry);
  const restore = useEffectEvent(() => {
    const saved = savedDraft() ?? defaultValue;
    if (shownEntry.current === entry) {
      // Text typed before hydration, while the router had no entry to save it in yet.
      if (input !== (saved ?? "")) saveDraft(input);
      return;
    }
    shownEntry.current = entry;
    if (saved === undefined) return;
    setInput(saved);
    setQuery(saved);
  });

  useEffect(() => {
    if (drafts) restore();
  }, [drafts, entry]);

  const draftTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(draftTimer.current), []);

  // A hidden sheet loses its scroll position without a scroll event.
  useEffect(() => {
    if (!open) setFirstRow(0);
  }, [open]);

  const close = () => {
    setFocused(false);
    setSelected(undefined);
  };
  // A pick or a submitted name is done with the box: the sheet closes, the text clears and the keyboard goes (focus moves
  // on to the page that opens). The result cards' box keeps a submitted name, since the cards below are for it.
  const done = (keep = false) => {
    close();
    // Back to this page shows its own text again (the cards' name, a board's player), not what was typed over it.
    clearTimeout(draftTimer.current);
    if (drafts) saveDraft(undefined);
    if (!keep) {
      setInput("");
      setQuery("");
    }
    inputRef.current?.blur();
  };

  const ref = useOutsideClick<HTMLFormElement>(close);

  useEffect(() => {
    if (!shortcut) return;

    const focus = (event: KeyboardEvent) => {
      if (event.key !== "/" || event.defaultPrevented || typing(event)) return;
      event.preventDefault();
      inputRef.current?.focus();
      inputRef.current?.select();
    };

    document.addEventListener("keydown", focus);
    return () => document.removeEventListener("keydown", focus);
  }, [shortcut]);

  function onSelectionChange(selected: number) {
    setSelected(selected);
    if (names) setInput(names[selected]);

    const visible = containerRef.current?.clientHeight ?? 0;
    const maxScroll = count * size.itemHeight - visible;
    const halfVisible = Math.floor(visible / 2);
    let scrollTop = selected * size.itemHeight - halfVisible + size.itemHeight / 2;
    scrollTop = Math.max(0, Math.min(scrollTop, maxScroll));

    containerRef.current?.scrollTo({
      top: scrollTop,
      behavior: "instant",
    });
  }

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- onBlur only closes the sheet when focus leaves the whole search
    <form
      ref={ref}
      className={cn("relative", className)}
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        // Only spaces is nothing to search for.
        const query = String(formData.get("search") ?? "").trim();
        if (!query) return;
        done(target === "results" && !onSelect);
        void go(query);
      }}
      // Tabbing out closes the sheet, so it never lies over the element with focus. Focus going nowhere (a click on
      // the page) is the outside click's to judge.
      onBlur={(event) => {
        if (event.relatedTarget instanceof Node && !event.currentTarget.contains(event.relatedTarget)) close();
      }}
    >
      {/* A square, solid input; the focus ring sits inside its edge. */}
      <div className={cn("flex items-center bg-blackify-800 focus-within:focus-ring-inset", size.bar)}>
        <SearchIcon className={cn("shrink-0 text-mc-gray", size.icon)} />
        <input
          ref={inputRef}
          id={inputId}
          name="search"
          data-draft={drafts || undefined}
          // A draft or early typing the server's HTML doesn't have (`initial`).
          suppressHydrationWarning
          aria-keyshortcuts={shortcut ? "/" : undefined}
          placeholder={placeholder ?? t("search.placeholder")}
          // A placeholder too long for a phone ends in an ellipsis rather than mid-letter.
          className={cn("placeholder:text-mc-gray text-white focus-ring-none h-full w-full min-w-0 text-ellipsis selection:bg-white/50", size.text)}
          value={input}
          onChange={(event) => {
            const { value } = event.target;
            setQuery(value);
            setInput(value);
            setFocused(true);
            clearTimeout(draftTimer.current);
            if (drafts) draftTimer.current = setTimeout(() => saveDraft(value), DRAFT_DEBOUNCE_MS);
          }}
          // Enter submits the form natively; the arrows move through the suggestions when there are any.
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              close();
              return;
            }

            if (count === 0) return;

            if (event.key === "ArrowDown") {
              event.preventDefault();
              onSelectionChange(((selected ?? -1) + 1) % count);
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              onSelectionChange(selected ? selected - 1 : count - 1);
            }
          }}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={listId}
          aria-activedescendant={selected === undefined ? undefined : optionId(selected)}
          spellCheck={false}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          enterKeyHint="search"
          disabled={disabled}
          onFocus={() => setFocused(true)}
          aria-label={label}
        />
      </div>
      <div
        ref={containerRef}
        id={listId}
        role="listbox"
        aria-label={label}
        hidden={!open}
        onScroll={(event) => setFirstRow(Math.floor(event.currentTarget.scrollTop / size.itemHeight))}
        className={cn("absolute z-100 w-full overflow-auto bg-blackify-800 shadow-[4px_4px_0_rgb(0_0_0_/_0.5)]", size.sheet)}
      >
        {names?.map((name, index) => (
          <SearchPlayer
            key={name}
            id={optionId(index)}
            player={name}
            head={index >= firstRow && index < firstRow + size.rows}
            selected={selected === index}
            target={target}
            compact={compact}
            onSelect={onSelect}
            onPick={() => done()}
          />
        ))}
      </div>
      {drafts && !hydrated && (
        <script suppressHydrationWarning dangerouslySetInnerHTML={{ __html: "__searchDraft(document.currentScript.parentElement)" }} />
      )}
    </form>
  );
}

function SearchPlayer({
  id,
  player,
  head,
  selected = false,
  target,
  compact,
  onSelect,
  onPick,
}: {
  id: string;
  player: string;
  /** Whether the row is in view, so its head loads; its slot keeps the name in place either way. */
  head: boolean;
  selected?: boolean;
  target: SearchTarget;
  compact: boolean;
  onSelect?: (name: string) => unknown;
  /** Closes the sheet once the row is picked. */
  onPick: () => void;
}) {
  const size = SIZES[compact ? "compact" : "regular"];
  const className = cn(
    "relative flex items-center gap-4 w-full hover:bg-white/10 active:bg-white/5 aria-selected:bg-white/10 aria-selected:before:content-[''] aria-selected:before:absolute aria-selected:before:bg-blueify-500 aria-selected:before:h-full aria-selected:before:w-1 aria-selected:before:left-0",
    size.item
  );
  const content = (
    <>
      <span className={cn("shrink-0", size.headSlot)}>{head && <SkinHead name={player} size={size.head} />}</span>
      <p className={cn("text-white selection:bg-white/50", size.text)}>{player}</p>
    </>
  );

  // Rows are reached with the arrow keys (`aria-activedescendant`), so Tab leaves the box rather than walking them.
  // With a handler the suggestion is handed over like a submitted name (the leaderboard `around` box).
  if (onSelect) {
    return (
      <button
        id={id}
        type="button"
        role="option"
        tabIndex={-1}
        onClick={() => {
          onPick();
          void onSelect(player);
        }}
        aria-selected={selected}
        className={className}
      >
        {content}
      </button>
    );
  }

  // Otherwise suggestions open the page they name; only the submitted text goes to the result cards.
  if (typeof target === "object") {
    return (
      <Link
        id={id}
        role="option"
        tabIndex={-1}
        to="/{-$locale}/player/$name/$game"
        params={{ name: player, game: target.game }}
        search={target.search}
        state={searchState}
        onClick={onPick}
        aria-selected={selected}
        className={className}
      >
        {content}
      </Link>
    );
  }

  if (target === "bingo") {
    return (
      <Link
        id={id}
        role="option"
        tabIndex={-1}
        to="/{-$locale}/player/$name/bingo"
        params={{ name: player }}
        state={searchState}
        onClick={onPick}
        aria-selected={selected}
        className={className}
      >
        {content}
      </Link>
    );
  }

  return (
    <Link
      id={id}
      role="option"
      tabIndex={-1}
      to="/{-$locale}/player/$name"
      params={{ name: player }}
      state={searchState}
      onClick={onPick}
      aria-selected={selected}
      className={className}
    >
      {content}
    </Link>
  );
}
