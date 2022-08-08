/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { APIData } from "@statsify/util";
import { Challenges } from "./challenges";
import { Events } from "./events";
import { Field } from "../../../metadata";
import { GameModes, IGameModes } from "../../../game";
import { getNetworkLevel } from "./util";

export const GENERAL_MODES = new GameModes([{ api: "overall" }]);
export type GeneralModes = IGameModes<typeof GENERAL_MODES>;

export class General {
  @Field()
  public achievementPoints: number;

  @Field()
  public giftsSent: number;

  @Field()
  public karma: number;

  @Field({
    leaderboard: {
      fieldName: "Network Level",
      hidden: true,
      limit: Number.POSITIVE_INFINITY,
      formatter: getNetworkLevel,
      additionalFields: ["stats.general.networkLevel"],
    },
  })
  public networkExp: number;

  @Field({ leaderboard: { enabled: false }, store: { default: 1 } })
  public networkLevel: number;

  @Field()
  public currentRewardStreak: number;

  @Field()
  public highestRewardStreak: number;

  @Field()
  public tournamentTributes: number;

  @Field()
  public ranksGifted: number;

  @Field({ leaderboard: { fieldName: "Tokens", name: "Classic Tokens" } })
  public classicTokens: number;

  @Field()
  public events: Events;

  @Field({ leaderboard: { fieldName: "" } })
  public challenges: Challenges;

  public constructor(data: APIData, legacy: APIData) {
    this.achievementPoints = data.achievementPoints;

    this.challenges = new Challenges(data?.challenges?.all_time ?? {});

    this.karma = data.karma;
    this.networkExp = data.networkExp;
    this.networkLevel = getNetworkLevel(this.networkExp);

    this.giftsSent = data.giftingMeta?.bundlesGiven;
    this.ranksGifted = data.giftingMeta?.ranksGiven;

    this.classicTokens = legacy.total_tokens;

    this.events = new Events(data.seasonal);
  }
}

export * from "./events";
export * from "./challenges";
export * from "./quests";
