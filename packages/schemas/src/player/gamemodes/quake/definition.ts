/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { CoinsSchema, KillsStats, WinsSchema } from "../common.js";
import { FormattedGame } from "#game";
import {
  type GamePrefix,
  createPrefixProgression,
  defaultPrefix,
  getFormattedPrefix,
} from "#prefixes";
import { ProgressionSchema } from "../../../progression.definition.js";
import { deepAdd, ratio } from "@statsify/math";
import { s } from "#definition/s";
import type { APIData } from "@statsify/util";

const indexes = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];

const prefixes: GamePrefix[] = [
  { fmt: (n) => `§8[${n}]`, req: 0 },
  { fmt: (n) => `§7[${n}]`, req: 25_000 },
  { fmt: (n) => `§f[${n}]`, req: 50_000 },
  { fmt: (n) => `§2[${n}]`, req: 75_000 },
  { fmt: (n) => `§e[${n}]`, req: 100_000 },
  { fmt: (n) => `§a[${n}]`, req: 200_000 },
  { fmt: (n) => `§9[${n}]`, req: 300_000 },
  { fmt: (n) => `§3[${n}]`, req: 400_000 },
  { fmt: (n) => `§d[${n}]`, req: 500_000 },
  { fmt: (n) => `§5[${n}]`, req: 600_000 },
  { fmt: (n) => `§c[${n}]`, req: 750_000 },
  { fmt: (n) => `§6[${n}]`, req: 1_000_000 },
  { fmt: (n) => `§0[${n}]`, req: 2_000_000 },
];

const QuakeModeSchema = s.object({
  wins: WinsSchema.color("§a"),
  ...KillsStats,
  headshots: s.number().color("§c"),
  killstreaks: s.number().color("§6"),
  shotsFired: s.number().color("§a").leaderboard(false),
  postUpdateKills: s.number().leaderboard({ fieldName: "2017+ Kills", name: "2017+ Kills" }),
  kwr() {
    return s.number().computed(ratio, [this.kills, this.wins]).color("§c").leaderboard(false);
  },
  quakeShotAccuracy() {
    return s
      .number()
      .computed((kills, shotsFired) => ratio(kills, shotsFired, 100), [
        this.postUpdateKills,
        this.shotsFired,
      ])
      .color("§6")
      .leaderboard(false);
  },
});

type QuakeModeInput = s.input<typeof QuakeModeSchema>;

export const QuakeSchema = s
  .object({
    progression() {
      return ProgressionSchema.computed((kills) => createPrefixProgression(prefixes, kills), [
        this.overall.kills,
      ]);
    },
    currentPrefix() {
      return s
        .string()
        .computed((score) => getFormattedPrefix({ prefixes, score }), [this.overall.kills]);
    },
    naturalPrefix() {
      return s
        .string()
        .computed((score) => getFormattedPrefix({ prefixes, score, trueScore: true }), [
          this.overall.kills,
        ])
        .default(defaultPrefix(prefixes));
    },
    nextPrefix() {
      return s
        .string()
        .computed((score) => getFormattedPrefix({ prefixes, score, skip: true }), [
          this.overall.kills,
        ]);
    },
    overall: QuakeModeSchema,
    solo: QuakeModeSchema,
    teams: QuakeModeSchema,
    coins: CoinsSchema.color("§6"),
    highestKillstreak: s.number().color("§4"),
    godlikes: s.number().color("§3"),
    tokens: s.number().color("§e"),
    trigger: s.number().color("§b").default(1.3).leaderboard(false),
  })
  .leaderboard((quake) => ({
    fieldName: FormattedGame.QUAKE,
    extraDisplay: quake.naturalPrefix,
  }));

export type Quake = s.infer<typeof QuakeSchema>;

function quakeMode(data: APIData, mode: string): QuakeModeInput {
  const suffix = mode ? `_${mode}` : mode;

  return {
    wins: data[`wins${suffix}`],
    kills: data[`kills${suffix}`],
    deaths: data[`deaths${suffix}`],
    headshots: data[`headshots${suffix}`],
    killstreaks: data[`killstreaks${suffix}`],
    shotsFired: data[`shots_fired${suffix}`],
    postUpdateKills: data[`kills_since_update_feb_2017${suffix}`],
  };
}

// Hypixel spells the trigger out in seconds, so NINE_POINT_ZERO is 9.0
const parseTrigger = (trigger: string | undefined) =>
  Number(
    trigger
      ?.toLowerCase()
      .split("_")
      .map((part) => (indexes.includes(part) ? indexes.indexOf(part) : "."))
      .join("")
  ) || 1.3;

export function quake(
  data: APIData = {},
  ap: APIData = {},
  legacy: APIData = {}
): s.input<typeof QuakeSchema> {
  const solo = quakeMode(data, "");
  const teams = quakeMode(data, "teams");

  return {
    overall: deepAdd(solo, teams),
    solo,
    teams,
    coins: data.coins,
    highestKillstreak: data.highest_killstreak,
    godlikes: ap.quake_godlikes,
    tokens: legacy.quakecraft_tokens,
    trigger: parseTrigger(data.trigger),
  };
}
