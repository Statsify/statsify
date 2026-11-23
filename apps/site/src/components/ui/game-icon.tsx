/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import type { GameCode } from "@statsify/schemas";

type IconName = GameCode | "CHALLENGES" | "QUESTS";

/** The icons of the pages that aren't one game's, by page key. */
const PAGE_ICONS = new Map<string, IconName>([
  ["challenges", "CHALLENGES"],
  ["quests", "QUESTS"],
]);

// One PNG per name in `public/games/`.
export const GAME_ICONS = new Set<string>([
  "ARCADE",
  "ARENA_BRAWL",
  "BEDWARS",
  "BLITZSG",
  "BUILD_BATTLE",
  "CHALLENGES",
  "CLASSIC",
  "COPS_AND_CRIMS",
  "CRAZY_WALLS",
  "DUELS",
  "GENERAL",
  "HOUSING",
  "MAIN_LOBBY",
  "MEGAWALLS",
  "MURDER_MYSTERY",
  "PAINTBALL",
  "PARKOUR",
  "PIT",
  "PROTOTYPE",
  "QUAKE",
  "QUESTS",
  "REPLAY",
  "SKYBLOCK",
  "SKYCLASH",
  "SKYWARS",
  "SMASH_HEROES",
  "SMP",
  "SPEED_UHC",
  "TNT_GAMES",
  "TOURNAMENT_LOBBY",
  "TURBO_KART_RACERS",
  "UHC",
  "VAMPIREZ",
  "WALLS",
  "WARLORDS",
  "WOOLGAMES",
]);

/** Whether `public/games/` has an icon for the code. */
export const hasGameIcon = (game: string): game is IconName => GAME_ICONS.has(game);

/** A game page's or leaderboard group's icon: its game's code, or the page's own where it has no game (Quests). */
export const pageIcon = (game: string | null, key: string): string | undefined => game ?? PAGE_ICONS.get(key);

/** `alt` names the game where the icon stands alone; beside the game's printed name it stays empty. */
export function GameIcon({ game, alt = "" }: { game: IconName; alt?: string }) {
  if (!GAME_ICONS.has(game)) throw new Error(`Unsupported GameIcon ${game}`);

  return <img src={`/games/${game}.png`} width={32} height={32} alt={alt} loading="lazy" decoding="async" />;
}
