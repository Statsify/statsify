/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { APIData } from "@statsify/util";
import { Events } from "./events";
import { Field } from "../../../metadata";
import { GameModes } from "../../../game";
import { GameType, GetMetadataModes, StatsifyApiModes } from "../../../metadata/GameType";
import { getNetworkLevel } from "./util";

@GameType("overall")
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
      additionalFields: ["this.networkLevel"],
    },
  })
  public networkExp: number;

  @Field({ leaderboard: { enabled: false }, store: { default: 1 } })
  public networkLevel: number;

  @Field({ leaderboard: { additionalFields: ["this.highestRewardStreak"] } })
  public currentRewardStreak: number;

  @Field({ leaderboard: { additionalFields: ["this.currentRewardStreak"] } })
  public highestRewardStreak: number;

  @Field()
  public tournamentTributes: number;

  @Field()
  public ranksGifted: number;

  @Field({ leaderboard: { fieldName: "Tokens", name: "Classic Tokens" } })
  public classicTokens: number;

  @Field()
  public events: Events;

  public constructor(data: APIData, legacy: APIData) {
    this.achievementPoints = data.achievementPoints;

    this.karma = data.karma;
    this.networkExp = data.networkExp || 1;
    this.networkLevel = getNetworkLevel(this.networkExp);

    this.currentRewardStreak = data.rewardScore;
    this.highestRewardStreak = data.rewardHighScore;

    this.tournamentTributes = data.tourney?.total_tributes;

    this.giftsSent = data.giftingMeta?.bundlesGiven;
    this.ranksGifted = data.giftingMeta?.ranksGiven;

    this.classicTokens = legacy.total_tokens;

    this.events = new Events(data.seasonal);
  }
}

type ExcludeKeys = "events";
export type GeneralModes = StatsifyApiModes<Omit<General, ExcludeKeys>, "overall">;
export const GENERAL_MODES = new GameModes<GeneralModes>(GetMetadataModes(General));

export * from "./events";
