/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { APIData } from "@statsify/util";
import {
  BuildBattleGuessTheBuild,
  BuildBattleMultiplayerMode,
  BuildBattleOverall,
  BuildBattlePro,
} from "./mode";
import { Field } from "../../../metadata";
import { GameModes, IGameModes } from "../../../game";
import { getTitleIndex, titleScores } from "./util";

export const BUILD_BATTLE_MODES = new GameModes([
  { api: "overall" },

  { hypixel: "BUILD_BATTLE_SOLO_NORMAL_LATEST", formatted: "1.14" },
  { hypixel: "BUILD_BATTLE_GUESS_THE_BUILD", formatted: "GTB" },
  { hypixel: "BUILD_BATTLE_TEAMS_NORMAL", formatted: "Teams" },
  { hypixel: "BUILD_BATTLE_SOLO_NORMAL", formatted: "Solo" },
  { hypixel: "BUILD_BATTLE_SOLO_PRO", formatted: "Pro" },
]);

export type BuildBattleModes = IGameModes<typeof BUILD_BATTLE_MODES>;

export class BuildBattle {
  @Field()
  public overall: BuildBattleOverall;

  @Field()
  public solo: BuildBattleMultiplayerMode;

  @Field()
  public teams: BuildBattleMultiplayerMode;

  @Field()
  public pro: BuildBattlePro;

  @Field()
  public guessTheBuild: BuildBattleGuessTheBuild;

  @Field()
  public coins: number;

  @Field()
  public score: number;

  @Field()
  public votes: number;

  @Field()
  public superVotes: number;

  @Field({ store: { default: titleScores[0].title } })
  public title: string;

  @Field({ store: { default: `${titleScores[0].color}${titleScores[0].title}` } })
  public titleFormatted: string;

  @Field({ leaderboard: { enabled: false } })
  public latestWins: number;

  public constructor(data: APIData) {
    this.overall = new BuildBattleOverall(data);
    this.solo = new BuildBattleMultiplayerMode(data, "solo");
    this.teams = new BuildBattleMultiplayerMode(data, "teams");
    this.pro = new BuildBattlePro(data);
    this.guessTheBuild = new BuildBattleGuessTheBuild(data);

    this.latestWins = data.wins_solo_normal_latest;
    this.coins = data.coins;
    this.score = data.score;

    this.votes = data.total_votes;
    this.superVotes = data.super_votes;

    const index = getTitleIndex(this.score);
    const { color, title } = titleScores[index];

    this.title = title;
    this.titleFormatted = `${color}${title}`;
  }
}

export * from "./mode";
