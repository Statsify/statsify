/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { CoinsSchema, KillsStats, WinsStats } from "../common.js";
import { type ExtractGameModes, FormattedGame, GameModes } from "#game";
import { type GamePrefix, rainbow } from "#prefixes";
import type { APIData } from "@statsify/util";
import { deepAdd } from "@statsify/math";
import { prefixFields } from "../prefix-fields.js";
import { s } from "#definition/s";

export const ARENA_BRAWL_MODES = new GameModes([
  { api: "overall" },
  { api: "solo" },
  { api: "doubles" },
  { api: "fours" },
] as const);

export type ArenaBrawlModes = ExtractGameModes<typeof ARENA_BRAWL_MODES>;

const prefixes: GamePrefix[] = [
  { fmt: (n) => `§8[${n}]`, req: 0 },
  { fmt: (n) => `§7[${n}]`, req: 500 },
  { fmt: (n) => `§a[${n}]`, req: 1000 },
  { fmt: (n) => `§2[${n}]`, req: 2000 },
  { fmt: (n) => `§d[${n}]`, req: 3000 },
  { fmt: (n) => `§5[${n}]`, req: 4000 },
  { fmt: (n) => `§c[${n}]`, req: 5000 },
  { fmt: (n) => `§4[${n}]`, req: 7500 },
  { fmt: (n) => `§6[${n}]`, req: 10_000 },
  { fmt: (n) => rainbow(`[${n}]`), req: 15_000 },
];

const prefix = prefixFields(prefixes);

export const ArenaBrawlModeSchema = s.object({ ...WinsStats, ...KillsStats });

export type ArenaBrawlMode = s.infer<typeof ArenaBrawlModeSchema>;

const ArenaBrawlModeExtSchema = s.object({
  ...WinsStats,
  ...KillsStats,
  winstreak: s.number().color("§a"),
});

export const ArenaBrawlSchema = s
  .object({
    progression() {
      return prefix.progression(this.overall.wins);
    },
    currentPrefix() {
      return prefix.currentPrefix(this.overall.wins);
    },
    naturalPrefix() {
      return prefix.naturalPrefix(this.overall.wins);
    },
    nextPrefix() {
      return prefix.nextPrefix(this.overall.wins);
    },
    overall: ArenaBrawlModeSchema,
    solo: ArenaBrawlModeExtSchema,
    doubles: ArenaBrawlModeExtSchema,
    fours: ArenaBrawlModeExtSchema,
    magicalChests: s.number().color("§5"),
    offensive: s.string().default("none"),
    utility: s.string().default("none"),
    ultimate: s.string().default("none"),
    support: s.string().default("none"),
    rune: s.string().default("none"),
    coins: CoinsSchema.color("§6"),
    keys: s.number().color("§b"),
    tokens: s.number().color("§e"),
  })
  .leaderboard((arenabrawl) => ({
    fieldName: FormattedGame.ARENA_BRAWL,
    extraDisplay: arenabrawl.naturalPrefix,
  }));

export type ArenaBrawl = s.infer<typeof ArenaBrawlSchema>;

function arenaBrawlMode(data: APIData, mode: string): s.input<typeof ArenaBrawlModeExtSchema> {
  return {
    wins: data[`wins_${mode}`],
    losses: data[`losses_${mode}`],
    kills: data[`kills_${mode}`],
    deaths: data[`deaths_${mode}`],
    winstreak: data[`win_streaks_${mode}`],
  };
}

export function arenaBrawl(data: APIData = {}, legacy: APIData = {}): s.input<typeof ArenaBrawlSchema> {
  const solo = arenaBrawlMode(data, "1v1");
  const doubles = arenaBrawlMode(data, "2v2");
  const fours = arenaBrawlMode(data, "4v4");

  return {
    overall: deepAdd(solo, doubles, fours),
    solo,
    doubles,
    fours,
    magicalChests: data.magical_chest,
    offensive: data.offensive || "none",
    utility: data.utility || "none",
    // Hypixel spelled berserk wrong
    ultimate: (data.ultimate || "none").replace("bersek", "berserk"),
    support: data.support || "none",
    rune: data.active_rune || "none",
    coins: data.coins,
    keys: data.keys,
    tokens: legacy.arena_tokens,
  };
}
