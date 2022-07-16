/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { APIData } from "@statsify/util";
import { Field } from "../../../metadata";
import { GameModes, IGameModes } from "../../../game";
import { GeneralUtil } from "./util";

export const GENERAL_MODES = new GameModes([{ api: "overall" }]);
export type GeneralModes = IGameModes<typeof GENERAL_MODES>;

export class General {
  @Field()
  public achievementPoints: number;

  @Field()
  public challenges: number;

  @Field()
  public giftsSent: number;

  @Field()
  public karma: number;

  @Field({
    leaderboard: {
      fieldName: "Network Level",
      hidden: true,
      limit: Number.POSITIVE_INFINITY,
      additionalFields: ["stats.general.networkLevel"],
    },
  })
  public networkExp: number;

  @Field({ leaderboard: { enabled: false }, store: { default: 1 } })
  public networkLevel: number;

  @Field()
  public quests: number;

  @Field()
  public ranksGifted: number;

  public constructor(data: APIData = {}) {
    this.achievementPoints = data.achievementPoints;

    this.challenges = Math.max(
      GeneralUtil.getChallenges(data.challenges),
      data.achievements?.general_challenger ?? 0
    );
    this.karma = data.karma;

    this.networkExp = data.networkExp;

    this.networkLevel = GeneralUtil.getNetworkLevel(this.networkExp);

    this.quests = GeneralUtil.getQuests(data.quests);

    this.giftsSent = data.giftingMeta?.bundlesGiven;
    this.ranksGifted = data.giftingMeta?.ranksGiven;
  }
}
