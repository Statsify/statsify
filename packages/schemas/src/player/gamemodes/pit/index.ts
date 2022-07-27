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
import { getBounty, getLevel, getLevelFormatted, getPres, getPresReq } from "./util";

export const PIT_MODES = new GameModes([
  { api: "overall", hypixel: "PIT", formatted: "Pit" },
]);

export type PitModes = IGameModes<typeof PIT_MODES>;

export class Pit {
  @Field({
    leaderboard: {
      fieldName: "Level",
      hidden: true,
      additionalFields: ["stats.pit.kills", "stats.pit.playtime"],
      formatter: (exp: number) => {
        const prestige = getPres(exp);
        const level = getLevel(prestige, exp);
        return getLevelFormatted(level, prestige);
      },
    },
  })
  public exp: number;

  @Field()
  public levelFormatted: string;

  @Field()
  public nextLevelFormatted: string;

  @Field()
  public progression: Progression;

  @Field()
  public gold: number;

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
  public damageDealt: number;

  @Field()
  public damageTaken: number;

  @Field()
  public assists: number;

  @Field()
  public tier1MysticsEnchanted: number;

  @Field()
  public tier2MysticsEnchanted: number;

  @Field()
  public tier3MysticsEnchanted: number;

  @Field()
  public totalMysticsEnchanted: number;

  @Field()
  public goldEarned: number;

  @Field({ leaderboard: { formatter: formatTime } })
  public playtime: number;

  @Field()
  public highestStreak: number;

  @Field()
  public blocksPlaced: number;

  @Field()
  public blocksBroken: number;

  @Field()
  public anythingFished: number;

  @Field()
  public joins: number;

  public constructor(profile: APIData, data: APIData) {
    this.exp = profile.xp;
    this.gold = profile.cash;
    this.renown = profile.renown;
    this.bounty = getBounty(profile.bounties);

    const prestige = getPres(this.exp);
    const level = getLevel(prestige, this.exp);

    this.progression = new Progression(this.exp, getPresReq(prestige + 1));

    this.levelFormatted = getLevelFormatted(level, prestige);

    this.contractsCompleted = data.contracts_completed;

    this.kills = data.kills;
    this.deaths = data.deaths;
    this.kdr = ratio(this.kills, this.deaths);

    this.damageDealt = data.damage_dealt;
    this.damageTaken = data.damage_received;

    this.assists = data.assists;

    this.tier1MysticsEnchanted = data.enchanted_tier1;
    this.tier2MysticsEnchanted = data.enchanted_tier2;
    this.tier3MysticsEnchanted = data.enchanted_tier3;

    this.totalMysticsEnchanted = add(
      this.tier1MysticsEnchanted,
      this.tier2MysticsEnchanted,
      this.tier3MysticsEnchanted
    );

    this.goldEarned = data.cash_earned;
    this.playtime = (data.playtime_minutes ?? 0) * 60 * 1000;
    this.highestStreak = data.max_streak;
    this.blocksPlaced = data.blocks_placed;
    this.blocksBroken = data.blocks_broken;
    this.anythingFished = data.fished_anything;
    this.joins = data.joins;
  }
}
