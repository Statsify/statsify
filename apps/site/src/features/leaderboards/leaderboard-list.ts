/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

/**
 * A leaderboard in the list `/leaderboards` filters: its field, its name under its game, and the words it also matches
 * that its name lacks (the stat's word on the bot's cards, the board's aliases).
 */
export interface ListBoard {
  field: string;
  name: string;
  terms?: string;
}

/** A game's leaderboards in that list. */
export interface ListGroup {
  key: string;
  /** The `GameId` for the icon, or `null` for groups without a game (quests, challenges). */
  game: string | null;
  name: string;
  leaderboards: ListBoard[];
}

/** A group without its leaderboards: all `/leaderboards` sends in its hydration data. */
export interface GroupSummary {
  key: string;
  game: string | null;
  name: string;
  count: number;
}

/** Where the list is served: the hash is its content's, so the file can be cached for good. */
const listUrl = (hash: string) => `/leaderboards-${hash}.json`;

/** "BedWars - Wins" and "BedWars Wins" read "Wins" under their BedWars heading; the filter still sees the game. */
export function withoutGroupPrefix<G extends { name: string; leaderboards: { name: string }[] }>(groups: G[]): G[] {
  return groups.map((group) => ({
    ...group,
    leaderboards: group.leaderboards.map((leaderboard) => {
      const short = /^ ?-? (.+)$/.exec(leaderboard.name.slice(group.name.length));
      return leaderboard.name.startsWith(group.name) && short ? { ...leaderboard, name: short[1] } : leaderboard;
    }),
  }));
}

/**
 * Words people shorten, each also matching the words it stands for: a game ("bw", BedWars) or a stat ("fk", final
 * kills). Kept here because no leaderboard sets the schema's aliases yet. The game URLs read the same table
 * (`gameKeysFor`).
 */
const ABBREVIATIONS: Record<string, string[]> = {
  ab: ["arena brawl"],
  bb: ["build battle", "beds broken"],
  bl: ["beds lost"],
  bsg: ["blitzsg"],
  bw: ["bedwars"],
  cac: ["cops and crims"],
  cvc: ["cops and crims"],
  fd: ["final deaths"],
  fk: ["final kills"],
  gp: ["games played"],
  hns: ["hide and seek"],
  ks: ["killstreak"],
  lvl: ["level"],
  mm: ["murder mystery"],
  mw: ["megawalls"],
  pb: ["paintball"],
  sh: ["smash heroes"],
  suhc: ["speeduhc"],
  sw: ["skywars"],
  tkr: ["turbo kart racers"],
  tnt: ["tnt games"],
  vz: ["vampirez"],
  woolwars: ["woolgames"],
  ws: ["winstreak"],
  ww: ["wool wars", "woolwars", "woolgames"],
  xp: ["exp"],
};

/** What a short name might be a game page's key for, as typed in a URL: "bw" is `bedwars`, "mm" `murdermystery`. */
export const gameKeysFor = (segment: string): string[] =>
  Object.hasOwn(ABBREVIATIONS, segment) ? [...new Set(ABBREVIATIONS[segment].map((full) => full.replaceAll(" ", "")))] : [];

/**
 * Every word of the query must appear in the text, as typed or, for an abbreviation, as the words it stands for:
 * "bw fk" finds BedWars Final Kills.
 */
function leaderboardMatcher(query: string): (text: string) => boolean {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);

  return (text) => {
    const lower = text.toLowerCase();
    return words.every((word) => lower.includes(word) || ABBREVIATIONS[word]?.some((full) => lower.includes(full)));
  };
}

/** The groups with only the leaderboards the query matches, in "<game> <leaderboard> <terms>", and none left empty. */
export function filterGroups(groups: ListGroup[], query: string): ListGroup[] {
  const matches = leaderboardMatcher(query);

  return groups
    .map((group) => ({
      ...group,
      leaderboards: group.leaderboards.filter(({ name, terms }) => matches(`${group.name} ${name} ${terms ?? ""}`)),
    }))
    .filter((group) => group.leaderboards.length > 0);
}

const HTML_ESCAPES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#x27;" };
const escapeHtml = (text: string) => text.replaceAll(/[&<>"']/g, (char) => HTML_ESCAPES[char]);

/** A group's links as list items, for a `<ul>` whose markup the server renders and hydration keeps as it is. */
export const boardLinksHtml = (boards: ListBoard[], href: (field: string) => string): string =>
  boards
    .map(({ field, name }) => `<li><a href="${escapeHtml(href(field))}">${escapeHtml(name)}</a></li>`)
    .join("");

const fetched = new Map<string, Promise<ListGroup[]>>();

/** The list, fetched once per hash and kept for the page's life; a failed fetch is forgotten, so the next try refetches. */
export function fetchLeaderboardList(hash: string): Promise<ListGroup[]> {
  let list = fetched.get(hash);

  if (!list) {
    list = fetch(listUrl(hash)).then((response) => {
      if (!response.ok) throw new Error(`The leaderboard list answered ${response.status}`);
      return response.json() as Promise<ListGroup[]>;
    });
    list.catch(() => fetched.delete(hash));
    fetched.set(hash, list);
  }

  return list;
}

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest;

  describe("leaderboardMatcher", () => {
    it("needs every word, as typed or as the words an abbreviation stands for", () => {
      const matches = leaderboardMatcher(" bw  fk ");
      expect(matches("BedWars Final Kills")).toBe(true);
      expect(matches("BedWars Overall bw fk")).toBe(true);
      expect(matches("BedWars Kills")).toBe(false);
      expect(leaderboardMatcher("")("anything")).toBe(true);
    });
  });
}
