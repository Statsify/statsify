/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { useSyncExternalStore } from "react";

/**
 * The browser's own record of the players it viewed, newest first, kept on the device only. One localStorage key,
 * versioned, that later viewer settings share; a write keeps whatever else is in it.
 */
const VIEWER_KEY = "statsify:viewer";

/** How many recent players the list keeps. */
const RECENT_LIMIT = 8;

/** A player by UUID, with the name they had when last seen, so a rename or a reused name can be caught. */
export interface RecentPlayer {
  uuid: string;
  name: string;
}

const NONE: RecentPlayer[] = [];

const isRecentPlayer = (value: unknown): value is RecentPlayer =>
  typeof value === "object" && value !== null && typeof (value as RecentPlayer).uuid === "string" && typeof (value as RecentPlayer).name === "string";

/** The stored object, or an empty one for nothing, another version or anything unreadable. */
function parse(raw: string | null): Record<string, unknown> {
  try {
    const viewer: unknown = raw === null ? null : JSON.parse(raw);
    return typeof viewer === "object" && viewer !== null && (viewer as { v?: unknown }).v === 1 ? (viewer as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

// The last read, so the store hands React the same list until the stored text changes.
let last: { raw: string | null; recent: RecentPlayer[] } | undefined;

function read(): RecentPlayer[] {
  let raw: string | null;

  // Storage can be off (a privacy setting) or blocked; then there's no list.
  try {
    raw = localStorage.getItem(VIEWER_KEY);
  } catch {
    return NONE;
  }

  if (last?.raw !== raw) {
    const { recent } = parse(raw);
    last = { raw, recent: Array.isArray(recent) ? recent.filter(isRecentPlayer).slice(0, RECENT_LIMIT) : NONE };
  }

  return last.recent;
}

const listeners = new Set<() => void>();

function write(recent: RecentPlayer[]) {
  try {
    localStorage.setItem(VIEWER_KEY, JSON.stringify({ ...parse(localStorage.getItem(VIEWER_KEY)), v: 1, recent }));
  } catch {
    // Off or full: the list stays as it was.
    return;
  }

  for (const listener of listeners) listener();
}

/** Moves a player to the front, without a second entry for them. */
export const addRecentPlayer = (player: RecentPlayer) =>
  write([player, ...read().filter(({ uuid }) => uuid !== player.uuid)].slice(0, RECENT_LIMIT));

/** A player's new name, or `null` to drop a player who no longer exists. */
export const updatePlayer = (uuid: string, name: string | null) =>
  write(read().flatMap((player) => (player.uuid !== uuid ? [player] : name === null ? [] : [{ uuid, name }])));

export const clearPlayers = () => write(NONE);

function subscribe(listener: () => void) {
  // Another tab's changes arrive as storage events.
  const onStorage = (event: StorageEvent) => event.key === VIEWER_KEY && listener();
  listeners.add(listener);
  addEventListener("storage", onStorage);

  return () => {
    listeners.delete(listener);
    removeEventListener("storage", onStorage);
  };
}

/** The recent players, or `null` on the server and while hydrating, so the server's HTML is the same for everyone. */
export const useRecentPlayers = () => useSyncExternalStore<RecentPlayer[] | null>(subscribe, read, () => null);

/**
 * Before first paint on `/player`: the number of recent players as `--recent` on the root, so the section's space is
 * held before React draws it (`recent-hold` in app.css).
 */
export const HOLD_SCRIPT = `try{var v=JSON.parse(localStorage.getItem(${JSON.stringify(VIEWER_KEY)}));var n=v&&v.v===1&&Array.isArray(v.recent)?Math.min(v.recent.length,${RECENT_LIMIT}):0;if(n)document.documentElement.style.setProperty("--recent",n)}catch(e){}`;
