/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  AssistsSchema,
  CoinsSchema,
  FinalKillsStats,
  KillsStats,
  KitFinalKillsStats,
  KitKillsStats,
  KitWinsStats,
  WinsStats,
} from "../common.js";
import { FormattedGame } from "#game";
import { MEGAWALLS_MODES } from "./index.js";
import { add } from "@statsify/math";
import { formats } from "#definition/format";
import { s } from "#definition/s";
import type { APIData } from "@statsify/util";

const limit = 10_000;

const WitherStats = s.fields({
  witherDamage: s.number().color("§c").leaderboard(false),
  witherKills: s.number().color("§6").leaderboard(false),
});

const MegaWallsKitSchema = s
  .object({
    ...KitWinsStats,
    ...KitKillsStats,
    finalKills: KitFinalKillsStats.finalKills,
    finalAssists: s.number().color("§e").leaderboard(false),
    finalDeaths: KitFinalKillsStats.finalDeaths,
    fkdr: KitFinalKillsStats.fkdr,
    assists: s.number().color("§e").leaderboard(false),
    playtime: s.number().color("§a").format(formats.time).leaderboard({ limit }),
    ...WitherStats,
    points: s.number().color("§e").leaderboard({ limit }),
  })
  .optional();

const MegaWallsOverallSchema = s.object({
  ...WinsStats,
  ...KillsStats,
  finalKills: FinalKillsStats.finalKills,
  finalAssists: s.number().color("§e"),
  finalDeaths: FinalKillsStats.finalDeaths,
  fkdr: FinalKillsStats.fkdr,
  assists: AssistsSchema.color("§e"),
  playtime: s.number().color("§a").format(formats.time),
  ...WitherStats,
  points: s.number().color("§e").leaderboard({ limit }),
});

const KITS = MEGAWALLS_MODES.getApiModes().filter(
  (mode): mode is Exclude<typeof mode, "overall"> => mode !== "overall"
);

type Kit = (typeof KITS)[number];

const kitSchemas = Object.fromEntries(KITS.map((kit) => [kit, MegaWallsKitSchema])) as Record<
  Kit,
  typeof MegaWallsKitSchema
>;

export const MegaWallsSchema = s
  .object({
    coins: CoinsSchema.color("§6"),
    mythicFavor: s.number(),
    class: s.string().default("none"),
    overall: MegaWallsOverallSchema,
    ...kitSchemas,
  })
  .leaderboard({ fieldName: FormattedGame.MEGAWALLS });

export type MegaWalls = s.infer<typeof MegaWallsSchema>;

function megaWallsKit(data: APIData, kit: string): s.input<typeof MegaWallsKitSchema> {
  const prefix = kit ? `${kit}_` : kit;

  return {
    wins: data[`${prefix}wins`],
    losses: data[`${prefix}losses`],
    kills: data[`${prefix}kills`],
    deaths: data[`${prefix}deaths`],
    finalKills: data[`${prefix}final_kills`],
    finalAssists: data[`${prefix}final_assists`],
    finalDeaths: data[`${prefix}final_deaths`],
    assists: data[`${prefix}assists`],
    playtime: (data[`${prefix}time_played`] ?? 0) * 60_000,
    witherDamage: data[`${prefix}wither_damage`],
    witherKills: data[`${prefix}wither_kills`],
    points: data[`${prefix}class_points`],
  };
}

export function megaWalls(data: APIData = {}): s.input<typeof MegaWallsSchema> {
  const kits = Object.fromEntries(KITS.map((kit) => [kit, megaWallsKit(data, kit)])) as Record<
    Kit,
    s.input<typeof MegaWallsKitSchema>
  >;

  return {
    coins: data.coins,
    mythicFavor: data.mythic_favor,
    class: data.chosen_class ?? "none",
    overall: {
      ...megaWallsKit(data, ""),
      finalDeaths: add(data.final_deaths, data.finalDeaths),
      witherDamage: add(data.wither_damage, data.witherDamage),
    },
    ...kits,
  };
}
