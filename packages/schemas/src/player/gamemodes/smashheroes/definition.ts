/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { CoinsSchema, KillsStats, WinsStats } from "../common.js";
import { type ExtractGameModes, FormattedGame, GameModes } from "#game";
import { s } from "#definition/s";
import type { APIData } from "@statsify/util";

export const SMASH_HEROES_MODES = new GameModes([
  { api: "overall" },
  { api: "solo", hypixel: "solo_normal" },
  { api: "doubles", hypixel: "2v2_normal" },
  { api: "teams", hypixel: "teams_normal" },
  { api: "botmon" },
  { api: "bulk" },
  { api: "cakeMonster" },
  { api: "cryomancer" },
  { api: "generalCluck" },
  { api: "greenHood" },
  { api: "karakot" },
  { api: "marauder" },
  { api: "pug" },
  { api: "sanic" },
  { api: "sergeantShield" },
  { api: "shoop" },
  { api: "skullfire" },
  { api: "spooderman" },
  { api: "tinman" },
  { api: "voidCrawler" },

  { hypixel: "1v1_normal", formatted: "1v1" },
  { hypixel: "friends_normal", formatted: "Friends" },
] as const);

export type SmashHeroesModes = ExtractGameModes<typeof SMASH_HEROES_MODES>;

const formatLevel = (level: number) => `§b${level}§6✶`;

/** Each kit's key in Hypixel's `class_stats` and `active_class` */
const KITS = [
  { property: "cakeMonster", key: "CAKE_MONSTER" },
  { property: "generalCluck", key: "GENERAL_CLUCK" },
  { property: "tinman", key: "TINMAN" },
  { property: "spooderman", key: "SPODERMAN" },
  { property: "skullfire", key: "SKULLFIRE" },
  { property: "karakot", key: "GOKU" },
  { property: "bulk", key: "THE_BULK" },
  { property: "botmon", key: "BOTMUN" },
  { property: "sanic", key: "SANIC" },
  { property: "marauder", key: "MARAUDER" },
  { property: "voidCrawler", key: "DUSK_CRAWLER" },
  { property: "pug", key: "PUG" },
  { property: "sergeantShield", key: "SERGEANT_SHIELD" },
  { property: "cryomancer", key: "FROSTY" },
  { property: "shoop", key: "SHOOP_DA_WHOOP" },
  { property: "greenHood", key: "GREEN_HOOD" },
] as const;

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
    ...s.keyed(KITS, () => SmashHeroesModeSchema),
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
  return {
    overall: smashHeroesMode(data, ""),
    solo: smashHeroesMode(data, "normal"),
    doubles: smashHeroesMode(data, "2v2"),
    teams: smashHeroesMode(data, "teams"),
    coins: data.coins,
    level: data.smashLevel,
    activeClass: data.active_class,
    ...s.keyed(KITS, ({ key }) => smashHeroesKit(data.class_stats?.[key])),
  };
}
