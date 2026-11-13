/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { CoinsSchema, KillsStats, WinsSchema } from "../common.js";
import { FormattedGame } from "#game";
import type { APIData } from "@statsify/util";
import type { GamePrefix } from "#prefixes";
import { add, ratio } from "@statsify/math";
import { prefixFields } from "../prefix-fields.js";
import { s } from "#definition/s";

const prefixes: GamePrefix[] = [
  { fmt: (n) => `§8[${n}]`, req: 0 },
  { fmt: (n) => `§7[${n}]`, req: 1000 },
  { fmt: (n) => `§f[${n}]`, req: 2500 },
  { fmt: (n) => `§2[${n}]`, req: 5000 },
  { fmt: (n) => `§e[${n}]`, req: 10_000 },
  { fmt: (n) => `§a[${n}]`, req: 20_000 },
  { fmt: (n) => `§9[${n}]`, req: 50_000 },
  { fmt: (n) => `§b[${n}]`, req: 75_000 },
  { fmt: (n) => `§d[${n}]`, req: 100_000 },
  { fmt: (n) => `§5[${n}]`, req: 200_000 },
  { fmt: (n) => `§c[${n}]`, req: 500_000 },
  { fmt: (n) => `§6[${n}]`, req: 1_000_000 },
];

const prefix = prefixFields(prefixes);

const perk = () => s.number().default(1).leaderboard(false);

const PaintballPerksSchema = s.object({
  adrenaline: perk().color("§4"),
  endurance: perk().color("§d"),
  fortune: perk().color("§2"),
  godfather: perk().color("§e"),
  headstart: perk().color("§c"),
  superluck: perk().color("§6"),
  transfusion: perk().color("§b"),
});

export const PaintballSchema = s
  .object({
    coins: CoinsSchema.color("§6"),
    forcefieldTime: s.number().color("§9").leaderboard(false),
    kills: KillsStats.kills,
    deaths: KillsStats.deaths,
    killstreaks: s.number().color("§b"),
    shotsFired: s.number().color("§c").leaderboard(false),
    hat: s.string().default("none"),
    wins: WinsSchema.color("§a"),
    kdr: KillsStats.kdr,
    shotAccuracy() {
      return s
        .number()
        .computed((kills, shotsFired) => ratio(kills, shotsFired, 100), [this.kills, this.shotsFired])
        .color("§6")
        .leaderboard(false);
    },
    perks: PaintballPerksSchema,
    tokens: s.number().color("§e"),
    progression() {
      return prefix.progression(this.kills);
    },
    currentPrefix() {
      return prefix.currentPrefix(this.kills);
    },
    naturalPrefix() {
      return prefix.naturalPrefix(this.kills);
    },
    nextPrefix() {
      return prefix.nextPrefix(this.kills);
    },
  })
  .leaderboard((paintball) => ({
    fieldName: FormattedGame.PAINTBALL,
    extraDisplay: paintball.naturalPrefix,
  }));

export type Paintball = s.infer<typeof PaintballSchema>;

function perks(data: APIData): s.input<typeof PaintballPerksSchema> {
  return {
    adrenaline: add(data.adrenaline, 1),
    endurance: add(data.endurance, 1),
    fortune: add(data.fortune, 1),
    godfather: add(data.godfather, 1),
    headstart: data.headstart, // Only one properly returned in API
    superluck: add(data.superluck, 1),
    transfusion: add(data.transfusion, 1),
  };
}

export function paintball(data: APIData = {}, legacy: APIData = {}): s.input<typeof PaintballSchema> {
  return {
    coins: data.coins,
    forcefieldTime: (data.forcefieldTime ?? 0) * 1000,
    kills: data.kills,
    deaths: data.deaths,
    killstreaks: data.killstreaks,
    shotsFired: data.shots_fired,
    hat: data.hat,
    wins: data.wins,
    perks: perks(data),
    tokens: legacy.paintball_tokens,
  };
}
