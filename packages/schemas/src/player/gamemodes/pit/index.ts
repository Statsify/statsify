/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { APIData, formatTime } from "@statsify/util";
import { Field } from "../../../metadata";
import { GameModes, IGameModes } from "../../../game";
import { Progression } from "../../../progression";
import { add, ratio } from "@statsify/math";
import {
  getBounty,
  getLevel,
  getLevelFormatted,
  getPrestige,
  getPrestigeReq,
} from "./util";

export const PIT_MODES = new GameModes([
  { api: "overall", hypixel: "PIT", formatted: "Pit" },
]);

export type PitModes = IGameModes<typeof PIT_MODES>;

export class Pit {
  @Field({
    leaderboard: {
      fieldName: "Level",
      hidden: true,
      additionalFields: ["this.kills", "this.playtime"],
      formatter: (exp: number) => {
        const prestige = getPrestige(exp);
        const level = getLevel(prestige, exp);
        return getLevelFormatted(level, prestige);
      },
    },
  })
  public exp: number;

  /**
   * Pit level including prestige (used for historical)
   */
  @Field({ leaderboard: { enabled: false } })
  public trueLevel: number;

  @Field()
  public levelFormatted: string;

  @Field()
  public nextLevelFormatted: string;

  @Field()
  public progression: Progression;

  @Field({ leaderboard: { additionalFields: ["this.lifetimeGold"] } })
  public gold: number;

  @Field({ leaderboard: { additionalFields: ["this.gold"] } })
  public lifetimeGold: number;

  @Field()
  public renown: number;

  @Field()
  public bounty: number;

  @Field()
  public contractsCompleted: number;

  @Field()
  public kills: number;

  @Field()
  public deaths: number;

  @Field()
  public kdr: number;

  @Field()
  public assists: number;

  @Field({
    leaderboard: { name: "Tier I Mystics Enchanted", fieldName: "Mystics Enchanted" },
  })
  public tier1MysticsEnchanted: number;

  @Field({
    leaderboard: { name: "Tier II Mystics Enchanted", fieldName: "Mystics Enchanted" },
  })
  public tier2MysticsEnchanted: number;

  @Field({
    leaderboard: { name: "Tier III Mystics Enchanted", fieldName: "Mystics Enchanted" },
  })
  public tier3MysticsEnchanted: number;

  @Field({
    leaderboard: { name: "Total Mystics Enchanted", fieldName: "Mystics Enchanted" },
  })
  public totalMysticsEnchanted: number;

  @Field({ leaderboard: { formatter: formatTime } })
  public playtime: number;

  @Field()
  public highestStreak: number;

  @Field()
  public joins: number;

  public constructor(profile: APIData, data: APIData) {
    this.exp = profile.xp ?? 0;
    this.gold = profile.cash;
    this.renown = profile.renown;
    this.bounty = getBounty(profile.bounties);

    const prestige = getPrestige(this.exp);
    const level = getLevel(prestige, this.exp);

    this.trueLevel = prestige * 120 + level;

    const lastPrestigeReq = getPrestigeReq(prestige - 1);

    this.progression = new Progression(
      this.exp - lastPrestigeReq,
      getPrestigeReq(prestige) - lastPrestigeReq
    );

    this.levelFormatted = getLevelFormatted(level, prestige);
    this.nextLevelFormatted = getLevelFormatted(1, prestige + 1);

    this.contractsCompleted = data.contracts_completed;

    this.kills = data.kills;
    this.deaths = data.deaths;
    this.kdr = ratio(this.kills, this.deaths);

    this.assists = data.assists;

    this.tier1MysticsEnchanted = data.enchanted_tier1;
    this.tier2MysticsEnchanted = data.enchanted_tier2;
    this.tier3MysticsEnchanted = data.enchanted_tier3;

    this.totalMysticsEnchanted = add(
      this.tier1MysticsEnchanted,
      this.tier2MysticsEnchanted,
      this.tier3MysticsEnchanted
    );

    this.lifetimeGold = data.cash_earned;
    this.playtime = (data.playtime_minutes ?? 0) * 60 * 1000;
    this.highestStreak = data.max_streak;
    this.joins = data.joins;
  }
}
