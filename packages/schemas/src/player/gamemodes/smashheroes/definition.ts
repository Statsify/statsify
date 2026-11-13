/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { CoinsSchema, KillsStats, WinsStats } from "../common.js";
import { FormattedGame } from "#game";
import { s } from "#definition/s";
import type { APIData } from "@statsify/util";

const formatLevel = (level: number) => `§b${level}§6✶`;

/** Each kit's key in Hypixel's `class_stats` and `active_class` */
const KITS = {
  cakeMonster: "CAKE_MONSTER",
  generalCluck: "GENERAL_CLUCK",
  tinman: "TINMAN",
  spooderman: "SPODERMAN",
  skullfire: "SKULLFIRE",
  karakot: "GOKU",
  bulk: "THE_BULK",
  botmon: "BOTMUN",
  sanic: "SANIC",
  marauder: "MARAUDER",
  voidCrawler: "DUSK_CRAWLER",
  pug: "PUG",
  sergeantShield: "SERGEANT_SHIELD",
  cryomancer: "FROSTY",
  shoop: "SHOOP_DA_WHOOP",
  greenHood: "GREEN_HOOD",
} as const;

type Kit = keyof typeof KITS;

const KIT_NAMES: Record<string, string> = {
  BOTMUN: "Botmon",
  CAKE_MONSTER: "Cake Monster",
  DUSK_CRAWLER: "Void Crawler",
  FROSTY: "Cryomancer",
  GENERAL_CLUCK: "General Cluck",
  GOKU: "Karakot",
  GREEN_HOOD: "Green Hood",
  MARAUDER: "Marauder",
  PUG: "Pug",
  SANIC: "Sanic",
  SERGEANT_SHIELD: "Sgt. Shield",
  SHOOP_DA_WHOOP: "Shoop",
  SKULLFIRE: "Skullfire",
  SPODERMAN: "Spooderman",
  THE_BULK: "Bulk",
  TINMAN: "Tinman",
};

const SmashHeroesModeSchema = s.object({
  ...WinsStats,
  ...KillsStats,
});

type SmashHeroesModeInput = s.input<typeof SmashHeroesModeSchema>;

export const SmashHeroesSchema = s
  .object({
    overall: SmashHeroesModeSchema,
    solo: SmashHeroesModeSchema,
    doubles: SmashHeroesModeSchema,
    teams: SmashHeroesModeSchema,
    coins: CoinsSchema.color("§6"),
    level: s.number().leaderboard(false),
    levelFormatted() {
      return s
        .string()
        .computed((level) => formatLevel(level ?? 0), [this.level])
        .default(formatLevel(0));
    },
    activeClass: s.string(),
    kit() {
      return s
        .string()
        .computed((activeClass) => KIT_NAMES[activeClass] ?? "none", [this.activeClass])
        .default("none");
    },
    ...s.keyed(Object.keys(KITS) as Kit[], () => SmashHeroesModeSchema),
  })
  .leaderboard((smashheroes) => ({
    fieldName: FormattedGame.SMASH_HEROES,
    extraDisplay: smashheroes.levelFormatted,
  }));

export type SmashHeroes = s.infer<typeof SmashHeroesSchema>;

function smashHeroesMode(data: APIData, mode: string): SmashHeroesModeInput {
  const suffix = mode ? `_${mode}` : mode;

  return {
    wins: data[`wins${suffix}`],
    losses: data[`losses${suffix}`],
    kills: data[`kills${suffix}`],
    deaths: data[`deaths${suffix}`],
  };
}

function smashHeroesKit(data: APIData = {}): SmashHeroesModeInput {
  return {
    wins: data.wins,
    losses: data.losses,
    kills: data.kills,
    deaths: data.deaths,
  };
}

export function smashHeroes(data: APIData = {}): s.input<typeof SmashHeroesSchema> {
  const kits = Object.fromEntries(
    Object.entries(KITS).map(([kit, key]) => [kit, smashHeroesKit(data.class_stats?.[key])])
  ) as Record<Kit, SmashHeroesModeInput>;

  return {
    overall: smashHeroesMode(data, ""),
    solo: smashHeroesMode(data, "normal"),
    doubles: smashHeroesMode(data, "2v2"),
    teams: smashHeroesMode(data, "teams"),
    coins: data.coins,
    level: data.smashLevel,
    activeClass: data.active_class,
    ...kits,
  };
}
