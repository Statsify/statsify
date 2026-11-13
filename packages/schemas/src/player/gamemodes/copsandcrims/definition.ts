/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type APIData, findScoreIndex } from "@statsify/util";
import { AssistsSchema, CoinsSchema, KillsStats, WinsSchema } from "../common.js";
import { FormattedGame } from "#game";
import { LEVEL_REQUIREMENTS, getFormattedLevel, getIntendedLevelFormatted } from "./util.js";
import { add } from "@statsify/math";
import { prefixProgression } from "../prefix-fields.js";
import { s } from "#definition/s";

const ModeStats = s.fields({
  wins: WinsSchema.color("§a"),
  ...KillsStats,
  assists: AssistsSchema.color("§e"),
});

const DefusalSchema = s.object({
  wins() {
    return WinsSchema.color("§a").leaderboard({ additionalFields: [this.roundWins] });
  },
  roundWins: s.number().color("§b"),
  ...KillsStats,
  assists: AssistsSchema.color("§e"),
  bombsPlanted: s.number().color("§c"),
  bombsDefused: s.number().color("§a"),
});

const DeathmatchSchema = s.object(ModeStats);

const GunGameSchema = s.object({
  ...ModeStats,
  fastestWin: s.number().color("§b").leaderboard(false),
});

const CopsAndCrimsOverallSchema = s.object({
  ...ModeStats,
  knifeKills: s.number().color("§7"),
  headshotKills: s.number().color("§4"),
  grenadeKills: s.number().color("§2"),
  shotsFired: s.number().color("§6"),
});

export const CopsAndCrimsSchema = s
  .object({
    coins: CoinsSchema.color("§6"),
    score: s.number().color("§a"),
    level: s.number().leaderboard(false),
    activeScheme: s.string(),
    activeEmblem: s.string(),
    naturalLevelFormatted() {
      return s
        .string()
        .computed(getIntendedLevelFormatted, [this.level])
        .default(getIntendedLevelFormatted(0));
    },
    levelFormatted() {
      return s
        .string()
        .computed(getFormattedLevel, [this.level, this.activeScheme, this.activeEmblem]);
    },
    nextLevelFormatted() {
      return s.string().computed((level) => getIntendedLevelFormatted(level + 1), [this.level]);
    },
    progression() {
      return prefixProgression(LEVEL_REQUIREMENTS, this.score);
    },
    overall: CopsAndCrimsOverallSchema,
    defusal: DefusalSchema,
    deathmatch: DeathmatchSchema,
    gunGame: GunGameSchema,
  })
  .leaderboard((copsandcrims) => ({
    fieldName: FormattedGame.COPS_AND_CRIMS,
    extraDisplay: copsandcrims.levelFormatted,
  }));

export type CopsAndCrims = s.infer<typeof CopsAndCrimsSchema>;

export function copsAndCrims(data: APIData = {}): s.input<typeof CopsAndCrimsSchema> {
  const defusal: s.input<typeof DefusalSchema> = {
    wins: data.game_wins,
    roundWins: data.round_wins,
    kills: data.kills,
    deaths: data.deaths,
    assists: data.assists,
    bombsPlanted: data.bombs_planted,
    bombsDefused: data.bombs_defused,
  };

  const deathmatch: s.input<typeof DeathmatchSchema> = {
    wins: data.game_wins_deathmatch,
    kills: data.kills_deathmatch,
    deaths: data.deaths_deathmatch,
    assists: data.assists_deathmatch,
  };

  const gunGame: s.input<typeof GunGameSchema> = {
    wins: data.game_wins_gungame,
    kills: data.kills_gungame,
    deaths: data.deaths_gungame,
    assists: data.assists_gungame,
    fastestWin: data.fastest_win_gungame,
  };

  const overall: s.input<typeof CopsAndCrimsOverallSchema> = {
    wins: add(defusal.wins, deathmatch.wins, gunGame.wins),
    kills: add(defusal.kills, deathmatch.kills, gunGame.kills),
    deaths: add(defusal.deaths, deathmatch.deaths, gunGame.deaths),
    assists: add(defusal.assists, deathmatch.assists, gunGame.assists),
    knifeKills: data.knife_kills,
    headshotKills: data.headshot_kills,
    grenadeKills: data.grenade_kills,
    shotsFired: data.shots_fired,
  };

  const hasScore = data.score !== undefined;

  const score = hasScore ?
    data.score :
    Math.floor(add((overall.kills ?? 0) / 2, add(defusal.bombsDefused, defusal.bombsPlanted) / 3, overall.wins));

  return {
    coins: data.coins,
    score,
    level: hasScore ? (data.level ?? 0) : findScoreIndex(LEVEL_REQUIREMENTS, score) + 1,
    activeScheme: data.active_scheme,
    activeEmblem: data.active_emblem,
    overall,
    defusal,
    deathmatch,
    gunGame,
  };
}
