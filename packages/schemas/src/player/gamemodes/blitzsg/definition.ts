/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type APIData, findScoreIndex } from "@statsify/util";
import { BLITZSG_MODES } from "./index.js";
import {
  CoinsSchema,
  KillsSchema,
  KillsStats,
  KitKillsStats,
  KitWinsStats,
  WinsSchema,
} from "../common.js";
import { FormattedGame } from "#game";
import {
  type GamePrefix,
  createPrefixProgression,
  defaultPrefix,
  getFormattedPrefix,
} from "#prefixes";
import { ProgressionSchema } from "../../../progression.definition.js";
import { add, sub } from "@statsify/math";
import { formats } from "#definition/format";
import { type NumberSchema, s } from "#definition/s";

const prefixes: GamePrefix[] = [
  { fmt: (n) => `§f[§7${n}§f]`, req: 0 },
  { fmt: (n) => `§e[${n}]`, req: 1000 },
  { fmt: (n) => `§a[${n}]`, req: 25_000 },
  { fmt: (n) => `§c[${n}]`, req: 50_000 },
  { fmt: (n) => `§b[${n}]`, req: 75_000 },
  { fmt: (n) => `§6§l[${n}]`, req: 100_000 },
  { fmt: (n) => `§5§l[${n}]`, req: 150_000 },
  { fmt: (n) => `§4§l[${n}]`, req: 200_000 },
  { fmt: (n) => `§9§l[${n}]`, req: 250_000 },
  { fmt: (n) => `§2§l[${n}]`, req: 300_000 },
];

const limit = 10_000;

const BlitzSGKitSchema = s
  .object({
    gamesPlayed: s.number().color("§b").leaderboard({ limit }),
    level: s.number().default(1).leaderboard(false),
    exp: s.number().color("§b").leaderboard({ limit, fieldName: "EXP" }),
    prestige: s.number().leaderboard(false),
    ...KitKillsStats,
    ...KitWinsStats,
    // Losses aren't ranked, but still show beside wins and WLR
    losses(): NumberSchema {
      return s
        .number()
        .color("§c")
        .leaderboard({ enabled: false, additionalFields: [this.wins, this.wlr] });
    },
    playtime: s.number().optional().color("§e").format(formats.time),
  })
  .optional();

const BlitzSGModeSchema = s.object({
  wins: WinsSchema.color("§e"),
  kills: KillsSchema.color("§a"),
});

const BlitzSGOverallSchema = s.object({
  wins: WinsSchema.color("§e"),
  ...KillsStats,
});

const KITS = BLITZSG_MODES.getApiModes().filter(
  (mode): mode is Exclude<typeof mode, "overall"> => mode !== "overall"
);

type Kit = (typeof KITS)[number];

// Hypixel's keys for these kits have a space
const KIT_KEYS: Partial<Record<Kit, string>> = {
  hypetrain: "hype train",
  shadowknight: "shadow knight",
};

const DEFAULT_KITS = [
  "archer",
  "meatmaster",
  "speleologist",
  "baker",
  "knight",
  "guardian",
  "scout",
  "hunter",
  "hype train",
  "fisherman",
  "armorer",
];

const SPECIAL_KITS = ["donkeytamer", "warrior", "ranger", "phoenix", "milkman"];
const SPECIAL_KIT_LEVELS = [1, 100, 250, 500, 1000, 1500, 2000, 2500, 5000, 10_000].map((req) => ({ req }));

const kitSchemas = Object.fromEntries(KITS.map((kit) => [kit, BlitzSGKitSchema])) as Record<
  Kit,
  typeof BlitzSGKitSchema
>;

export const BlitzSGSchema = s
  .object({
    coins: CoinsSchema.color("§6"),
    kit: s.string().default("none"),
    overall: BlitzSGOverallSchema,
    solo: BlitzSGModeSchema,
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
    doubles: BlitzSGModeSchema,
    ...kitSchemas,
  })
  .leaderboard((blitzsg) => ({
    fieldName: FormattedGame.BLITZSG,
    extraDisplay: blitzsg.naturalPrefix,
  }));

export type BlitzSG = s.infer<typeof BlitzSGSchema>;

function kitLevel(data: APIData, kit: string, exp: number) {
  if (kit in data) return data[kit] + 1;
  if (DEFAULT_KITS.includes(kit) && exp > 0) return 1;
  if (SPECIAL_KITS.includes(kit)) return findScoreIndex(SPECIAL_KIT_LEVELS, exp) + 1;
  return 1;
}

function blitzSGKit(data: APIData, kit: string): s.input<typeof BlitzSGKitSchema> {
  const gamesPlayed = data[`games_played_${kit}`];
  const exp = data[`exp_${kit}`];
  const wins = add(data[`wins_${kit}`], data[`wins_teams_${kit}`]);
  const deaths = sub(gamesPlayed, wins);

  return {
    gamesPlayed,
    level: kitLevel(data, kit, exp),
    exp,
    prestige: data[`p${kit}`],
    kills: data[`kills_${kit}`],
    deaths,
    wins,
    losses: deaths,
    playtime: (data[`time_played_${kit}`] ?? 0) * 1000,
  };
}

function blitzSGMode(data: APIData, mode: string): s.input<typeof BlitzSGModeSchema> {
  const suffix = mode ? `_${mode}` : mode;

  return {
    wins: data[`wins${suffix || "_solo_normal"}`],
    kills: data[`kills${suffix}`],
  };
}

export function blitzSG(data: APIData = {}): s.input<typeof BlitzSGSchema> {
  const solo = blitzSGMode(data, "");
  const doubles = blitzSGMode(data, "teams_normal");

  const kits = Object.fromEntries(
    KITS.map((kit) => [kit, blitzSGKit(data, KIT_KEYS[kit] ?? kit)])
  ) as Record<Kit, s.input<typeof BlitzSGKitSchema>>;

  return {
    coins: data.coins,
    kit: data.defaultkit || "none",
    overall: {
      wins: add(data.wins_solo_normal, data.wins_teams_normal),
      kills: data.kills,
      deaths: data.deaths,
    },
    solo: { ...solo, kills: sub(solo.kills, doubles.kills) },
    doubles,
    ...kits,
  };
}
