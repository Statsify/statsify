/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { AssistsSchema, CoinsSchema, ExpSchema, KillsStats, WinsSchema, WinsStats } from "../common.js";
import { FormattedGame } from "#game";
import { ProgressionSchema, progression } from "../../../progression.definition.js";
import { add, sub } from "@statsify/math";
import { formats } from "#definition/format";
import { getExpReq, getFormattedLevel, getLevel } from "./util.js";
import { type NumberSchema, s } from "#definition/s";
import type { APIData } from "@statsify/util";

const WoolWarsClassStats = s.fields({
  ...KillsStats,
  assists: AssistsSchema.color("§e"),
  powerups: s.number().color("§b").leaderboard({ name: "Power-Ups" }),
  blocksBroken(): NumberSchema {
    return s.number().color("§c").leaderboard({ additionalFields: [this.woolPlaced] });
  },
  woolPlaced() {
    return s.number().color("§e").leaderboard({ additionalFields: [this.blocksBroken] });
  },
});

const WoolWarsClassSchema = s.object(WoolWarsClassStats);

export type WoolWarsClass = s.infer<typeof WoolWarsClassSchema>;
type WoolWarsClassInput = s.input<typeof WoolWarsClassSchema>;

const WoolWarsOverallSchema = s.object({
  ...WoolWarsClassStats,
  wins: WinsStats.wins,
  gamesPlayed: s.number(),
  losses: WinsStats.losses,
  wlr: WinsStats.wlr,
});

export type WoolWarsOverall = s.infer<typeof WoolWarsOverallSchema>;

const WoolWarsSchema = s.object({
  overall: WoolWarsOverallSchema,
  tank: WoolWarsClassSchema,
  archer: WoolWarsClassSchema,
  builder: WoolWarsClassSchema,
  swordsman: WoolWarsClassSchema,
  engineer: WoolWarsClassSchema,
  golem: WoolWarsClassSchema,
  assault: WoolWarsClassSchema,
  class: s.string().default("none"),
});

export type WoolWars = s.infer<typeof WoolWarsSchema>;

const SheepWarsSchema = s.object({
  gamesPlayed: s.number().color("§e"),
  ...WinsStats,
  ...KillsStats,
  explosiveKills: s.number(),
  voidKills: s.number(),
  bowKills: s.number(),
  meleeKills: s.number(),
  sheepThrown: s.number().color("§c"),
  sheepKilled: s.number().color("§4"),
  magicWool: s.number().color("§5"),
  kit: s.string().default("none"),
});

export type SheepWars = s.infer<typeof SheepWarsSchema>;

const CaptureTheWoolSchema = s.object({
  ...WinsStats,
  draws: s.number().color("§e"),
  ...KillsStats,
  assists: AssistsSchema.color("§e"),
  woolCaptured: s.number().color("§b"),
  woolPickedUp: s.number().color("§2"),
  fastestWin() {
    return s
      .number()
      .color("§e")
      .format(formats.time)
      .leaderboard({ sort: "ASC", additionalFields: [this.wins] });
  },
  fastestWoolCapture() {
    return s
      .number()
      .color("§6")
      .format(formats.time)
      .leaderboard({ sort: "ASC", additionalFields: [this.woolCaptured] });
  },
  longestGame: s.number().color("§d").format(formats.time),
  goldEarned(): NumberSchema {
    return s.number().color("§6").leaderboard({ additionalFields: [this.goldSpent] });
  },
  goldSpent() {
    return s.number().color("§6").leaderboard({ additionalFields: [this.goldEarned] });
  },
  killsOnWoolHolder(): NumberSchema {
    return s.number().color("§a").leaderboard({ additionalFields: [this.deathsToWoolHolder] });
  },
  deathsToWoolHolder() {
    return s.number().color("§c").leaderboard({ additionalFields: [this.killsOnWoolHolder] });
  },
  killsAsWoolHolder(): NumberSchema {
    return s.number().color("§a").leaderboard({ additionalFields: [this.deathsAsWoolHolder] });
  },
  deathsAsWoolHolder() {
    return s.number().color("§c").leaderboard({ additionalFields: [this.killsAsWoolHolder] });
  },
});

export type CaptureTheWool = s.infer<typeof CaptureTheWoolSchema>;

const levelProgression = (exp: number, level: number) => {
  const flooredLevel = Math.floor(level);

  let levelExp = exp;
  for (let i = 0; i < flooredLevel; i++) levelExp -= getExpReq(i);

  return progression(levelExp, getExpReq(flooredLevel));
};

export const WoolGamesSchema = s
  .object({
    coins: CoinsSchema.color("§6"),
    layers: s.number().color("§a").leaderboard(false),
    exp() {
      return ExpSchema
        .format(formats.searchedAs(getLevel, (exp) => getFormattedLevel(Math.floor(getLevel(exp)))))
        .leaderboard({
          fieldName: "Level",
          hidden: true,
          additionalFields: [this.wins, this.playtime],
        });
    },
    level() {
      return s.number().computed(getLevel, [this.exp]).subtractInSessions().leaderboard(false);
    },
    levelFormatted() {
      return s.string().computed((level) => getFormattedLevel(Math.floor(level)), [this.level]);
    },
    progression() {
      return ProgressionSchema.computed(levelProgression, [this.exp, this.level]);
    },
    nextLevelFormatted() {
      return s.string().computed((level) => getFormattedLevel(Math.floor(level) + 1), [this.level]);
    },
    playtime: s.number().color("§d").format(formats.time),
    wins: WinsSchema,
    woolwars: WoolWarsSchema.leaderboard({ name: "WoolWars" }),
    sheepwars: SheepWarsSchema.leaderboard({ name: "SheepWars" }),
    captureTheWool: CaptureTheWoolSchema,
  })
  .leaderboard((woolgames) => ({
    fieldName: FormattedGame.WOOLGAMES,
    extraDisplay: woolgames.levelFormatted,
  }));

export type WoolGames = s.infer<typeof WoolGamesSchema>;

function woolWarsClass(data: APIData = {}): WoolWarsClassInput {
  return {
    kills: data.kills,
    deaths: data.deaths,
    assists: data.assists,
    powerups: data.powerups_gotten,
    blocksBroken: data.blocks_broken,
    woolPlaced: data.wool_placed,
  };
}

function woolWars(data: APIData = {}): s.input<typeof WoolWarsSchema> {
  const classes = data.stats?.classes;

  return {
    overall: {
      ...woolWarsClass(data.stats),
      wins: data.stats?.wins,
      gamesPlayed: data.stats?.games_played,
      losses: sub(data.stats?.games_played, data.stats?.wins),
    },
    tank: woolWarsClass(classes?.tank),
    archer: woolWarsClass(classes?.archer),
    builder: woolWarsClass(classes?.builder),
    swordsman: woolWarsClass(classes?.swordsman),
    engineer: woolWarsClass(classes?.engineer),
    golem: woolWarsClass(classes?.golem),
    assault: woolWarsClass(classes?.assault),
    class: data.selected_class,
  };
}

function sheepWars(data: APIData = {}, ap: APIData = {}): s.input<typeof SheepWarsSchema> {
  return {
    gamesPlayed: data.stats?.games_played,
    wins: data.stats?.wins,
    losses: data.stats?.losses,
    kills: data.stats?.kills,
    deaths: data.stats?.deaths,
    explosiveKills: data.stats?.kills_explosive,
    voidKills: data.stats?.kills_void,
    bowKills: data.stats?.kills_bow,
    meleeKills: data.stats?.kills_melee,
    sheepThrown: data.stats?.sheep_thrown,
    sheepKilled: ap.woolgames_sheep_wars_sheep_slayer,
    magicWool: data.stats?.magic_wool_hit,
    kit: data.default_kit,
  };
}

function captureTheWool(data: APIData = {}): s.input<typeof CaptureTheWoolSchema> {
  return {
    wins: data.participated_wins,
    losses: data.participated_losses,
    draws: data.participated_draws,
    kills: data.kills,
    deaths: data.deaths,
    assists: data.assists,
    woolCaptured: data.wools_captured,
    woolPickedUp: data.wools_stolen,
    fastestWin: (data.fastest_win ?? 0) * 1000,
    fastestWoolCapture: (data.fastest_wool_capture ?? 0) * 1000,
    longestGame: (data.longest_game ?? 0) * 1000,
    goldEarned: data.gold_earned,
    goldSpent: Math.abs(data.gold_spent ?? 0),
    killsOnWoolHolder: data.kills_on_woolholder,
    deathsToWoolHolder: data.deaths_to_woolholder,
    killsAsWoolHolder: data.kills_with_wool,
    deathsAsWoolHolder: data.deaths_with_wool,
  };
}

export function woolGames(data: APIData = {}, ap: APIData = {}): s.input<typeof WoolGamesSchema> {
  const woolwars = woolWars(data.wool_wars);
  const sheepwars = sheepWars(data.sheep_wars, ap);
  const ctw = captureTheWool(data.capture_the_wool?.stats);

  return {
    coins: data.coins,
    layers: data.progression?.available_layers,
    exp: Math.round(data.progression?.experience ?? 0),
    playtime: (data.playtime ?? 0) * 1000,
    wins: add(woolwars.overall.wins, sheepwars.wins, ctw.wins),
    woolwars,
    sheepwars,
    captureTheWool: ctw,
  };
}
