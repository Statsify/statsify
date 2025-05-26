/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type APIData, formatTime } from "@statsify/util";
import { type ExtractGameModes, GameModes } from "#game";
import { Field } from "#metadata";
import { Progression } from "#progression";
import {
  RenownUnlock,
  getBounty,
  getLevel,
  getLevelFormatted,
  getPrestige,
  getPrestigeReq,
  getRenownShopCost,
} from "./util.js";
import { add, ratio } from "@statsify/math";

export const PIT_MODES = new GameModes([
  { api: "overall" },
  { hypixel: "PIT", formatted: "Pit" },
] as const);

export type PitModes = ExtractGameModes<typeof PIT_MODES>;

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
    historical: {
      hidden: false,
      fieldName: "EXP Gained",
      additionalFields: ["this.trueLevel"],
      formatter: Number,
    },
  })
  public exp: number;

  /**
   * Pit level including prestige (used for historical)
   */
  @Field({
    leaderboard: { enabled: false },
    historical: { enabled: false, fieldName: "Levels Gained" },
  })
  public trueLevel: number;

  @Field()
  public levelFormatted: string;

  @Field()
  public nextLevelFormatted: string;

  @Field()
  public progression: Progression;

  @Field({
    leaderboard: { additionalFields: ["this.goldEarned"] },
    historical: { enabled: false },
  })
  public gold: number;

  @Field({
    leaderboard: { additionalFields: ["this.gold"] },
    historical: { additionalFields: [] },
  })
  public goldEarned: number;

  @Field({ historical: { enabled: false } })
  public renown: number;

  @Field()
  public lifetimeRenown: number;

  @Field({ historical: { enabled: false } })
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

  @Field({ leaderboard: { formatter: formatTime }, historical: { enabled: false } })
  public playtime: number;

  @Field({ historical: { enabled: false } })
  public highestStreak: number;

  @Field()
  public joins: number;

  @Field()
  public ragePotatoesEaten: number;

  @Field()
  public goldIngotsGathered: number;

  @Field()
  public blocksPlaced: number;

  @Field()
  public vampireHealing: number;

  public constructor(profile: APIData, data: APIData) {
    this.exp = profile.xp ?? 0;
    this.gold = profile.cash;
    this.renown = profile.renown;

    const darkPantsCreated = data.dark_pants_crated ?? 0;
    const renownUnlocks = (profile.renown_unlocks ?? []) as RenownUnlock[];
    const renownShopCost = getRenownShopCost(renownUnlocks.filter((unlock) => unlock.key !== "unlock_golden_pickaxe"));
    this.lifetimeRenown = add(renownShopCost, this.renown, 2 * darkPantsCreated);

    this.bounty = getBounty(profile.bounties);

    const prestige = getPrestige(this.exp);
    const level = getLevel(prestige, this.exp);

    this.trueLevel = prestige * 120 + level;

    const lastPrestigeReq = getPrestigeReq(prestige - 1);

    this.progression = new Progression(
      this.exp - lastPrestigeReq,
      Math.min(getPrestigeReq(prestige) - lastPrestigeReq, 11_787_293_080)
    );

    this.levelFormatted = getLevelFormatted(level, prestige);
    this.nextLevelFormatted =
      prestige === 50 ?
        getLevelFormatted(120, prestige) :
        getLevelFormatted(1, prestige + 1);

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

    this.goldEarned = data.cash_earned;
    this.playtime = (data.playtime_minutes ?? 0) * 60 * 1000;
    this.highestStreak = data.max_streak;
    this.joins = data.joins;

    this.ragePotatoesEaten = data.rage_potatoes_eaten;
    this.goldIngotsGathered = data.ingots_picked_up;
    this.blocksPlaced = data.blocks_placed;
    this.vampireHealing = data.vampire_healed_hp;
  }
}
