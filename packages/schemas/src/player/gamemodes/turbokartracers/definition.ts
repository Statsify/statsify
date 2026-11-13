/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { CoinsSchema } from "../common.js";
import { FormattedGame } from "#game";
import type { APIData } from "@statsify/util";
import type { GamePrefix } from "#prefixes";
import { add, ratio } from "@statsify/math";
import { prefixFields } from "../arenabrawl/prefix-fields.js";
import { type NumberSchema, s } from "#definition/s";

const prefixes: GamePrefix[] = [
  { fmt: (n) => `§8[${n}✪]`, req: 0 },
  { fmt: (n) => `§7[${n}✪]`, req: 5 },
  { fmt: (n) => `§f[${n}✪]`, req: 25 },
  { fmt: (n) => `§b[${n}✪]`, req: 50 },
  { fmt: (n) => `§a[${n}✪]`, req: 100 },
  { fmt: (n) => `§e[${n}✪]`, req: 200 },
  { fmt: (n) => `§9[${n}✪]`, req: 300 },
  { fmt: (n) => `§d[${n}✪]`, req: 400 },
  { fmt: (n) => `§6[${n}✪]`, req: 500 },
  { fmt: (n) => `§2[${n}✪]`, req: 750 },
  { fmt: (n) => `§1[${n}✪]`, req: 1000 },
  { fmt: (n) => `§5[${n}✪]`, req: 2500 },
  { fmt: (n) => `§4[${n}✪]`, req: 5000 },
  { fmt: (n) => `§0[${n}✪]`, req: 10_000 },
];

const prefix = prefixFields(prefixes);

export const TurboKartRacersSchema = s
  .object({
    coins: CoinsSchema.color("§6"),
    tokens: s.number().color("§e"),
    grandPrixTokens: s.number().color("§b"),
    lapsCompleted: s.number().color("§2"),
    boxesPickedUp: s.number().color("§c").leaderboard(false),
    coinsPickedUp: s.number().leaderboard(false),
    gamesPlayed: s.number().color("§a"),
    // Annotated because total is computed from them, which TypeScript can't infer in a cycle
    gold(): NumberSchema {
      return s.number().color("§#ffd700").leaderboard({ additionalFields: [this.total] });
    },
    silver(): NumberSchema {
      return s.number().color("§#c0c0c0").leaderboard({ additionalFields: [this.total] });
    },
    bronze(): NumberSchema {
      return s.number().color("§#cd7f32").leaderboard({ additionalFields: [this.total] });
    },
    total() {
      return s
        .number()
        .computed(add, [this.gold, this.silver, this.bronze])
        .color("§a")
        .leaderboard({ additionalFields: [this.gold, this.silver, this.bronze] });
    },
    trophyRate() {
      return s
        .number()
        .computed((total, gamesPlayed) => ratio(total, gamesPlayed, 100), [this.total, this.gamesPlayed])
        .color("§b")
        .leaderboard(false);
    },
    goldRate() {
      return s
        .number()
        .computed((gold, gamesPlayed) => ratio(gold, gamesPlayed, 100), [this.gold, this.gamesPlayed])
        .color("§6")
        .leaderboard(false);
    },
    progression() {
      return prefix.progression(this.gold);
    },
    currentPrefix() {
      return prefix.currentPrefix(this.gold);
    },
    naturalPrefix() {
      return prefix.naturalPrefix(this.gold);
    },
    nextPrefix() {
      return prefix.nextPrefix(this.gold);
    },
  })
  .leaderboard((turbokartracers) => ({
    fieldName: FormattedGame.TURBO_KART_RACERS,
    extraDisplay: turbokartracers.naturalPrefix,
  }));

export type TurboKartRacers = s.infer<typeof TurboKartRacersSchema>;

export function turboKartRacers(
  data: APIData = {},
  legacy: APIData = {}
): s.input<typeof TurboKartRacersSchema> {
  return {
    coins: data.coins,
    tokens: legacy.gingerbread_tokens,
    grandPrixTokens: data.grand_prix_tokens,
    lapsCompleted: data.laps_completed,
    boxesPickedUp: data.box_pickups,
    coinsPickedUp: data.coins_picked_up,
    gamesPlayed: add(
      data.retro_plays,
      data.olympus_plays,
      data.canyon_plays,
      data.hypixelgp_plays,
      data.junglerush_plays
    ),
    gold: data.gold_trophy,
    silver: data.silver_trophy,
    bronze: data.bronze_trophy,
  };
}
