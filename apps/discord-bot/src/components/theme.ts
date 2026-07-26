/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

export const SEMANTIC_COLORS = {
  positive: "#4ade80",
  negative: "#f87171",
  neutral: "#9ca3af",
  warning: "#fbbf24",
} as const;

export const GAME_COLORS = {
  arcade: "#fbbf24",
  arenaBrawl: "#f59e0b",
  bedwars: "#ef4444",
  blitzSg: "#22c55e",
  buildBattle: "#d946ef",
  copsAndCrims: "#f59e0b",
  duels: "#6366f1",
  general: "#64748b",
  megaWalls: "#6b7280",
  murderMystery: "#dc2626",
  paintball: "#38bdf8",
  pit: "#eab308",
  quake: "#a855f7",
  skyWars: "#38bdf8",
  smashHeroes: "#d946ef",
  speedUhc: "#f59e0b",
  tntGames: "#ef4444",
  turboKartRacers: "#4ade80",
  uhc: "#f59e0b",
  vampirez: "#dc2626",
  walls: "#eab308",
  warlords: "#ef4444",
  woolGames: "#3b82f6",
} as const;

export type GameColorKey = keyof typeof GAME_COLORS;
