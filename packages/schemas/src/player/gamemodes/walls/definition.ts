/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { AssistsSchema, CoinsSchema, KillsStats, WinsStats } from "../common.js";
import { FormattedGame } from "#game";
import { type GamePrefix, rainbow } from "#prefixes";
import type { APIData } from "@statsify/util";
import { prefixFields } from "../prefix-fields.js";
import { s } from "#definition/s";

const prefixes: GamePrefix[] = [
  { fmt: (n) => `§8[${n}]`, req: 0 },
  { fmt: (n) => `§7[${n}]`, req: 20 },
  { fmt: (n) => `§e[${n}]`, req: 50 },
  { fmt: (n) => `§a[${n}]`, req: 100 },
  { fmt: (n) => `§2[${n}]`, req: 200 },
  { fmt: (n) => `§9[${n}]`, req: 300 },
  { fmt: (n) => `§1[${n}]`, req: 400 },
  { fmt: (n) => `§d[${n}]`, req: 500 },
  { fmt: (n) => `§4[${n}]`, req: 750 },
  { fmt: (n) => `§6[${n}]`, req: 1000 },
  { fmt: (n) => `§0§l[${n}]`, req: 2000 },
  { fmt: (n) => rainbow(`[${n}]`), req: 2001 },
];

const prefix = prefixFields(prefixes, { abbreviation: false });

export const WallsSchema = s
  .object({
    coins: CoinsSchema.color("§6"),
    ...WinsStats,
    ...KillsStats,
    assists: AssistsSchema.color("§e"),
    tokens: s.number().color("§e"),
    progression() {
      return prefix.progression(this.wins);
    },
    currentPrefix() {
      return prefix.currentPrefix(this.wins);
    },
    naturalPrefix() {
      return prefix.naturalPrefix(this.wins);
    },
    nextPrefix() {
      return prefix.nextPrefix(this.wins);
    },
  })
  .leaderboard((walls) => ({
    fieldName: FormattedGame.WALLS,
    extraDisplay: walls.naturalPrefix,
  }));

export type Walls = s.infer<typeof WallsSchema>;

export function walls(data: APIData = {}, legacy: APIData = {}): s.input<typeof WallsSchema> {
  return {
    coins: data.coins,
    wins: data.wins,
    losses: data.losses,
    kills: data.kills,
    deaths: data.deaths,
    assists: data.assists,
    tokens: legacy.walls_tokens,
  };
}
