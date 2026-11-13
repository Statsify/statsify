/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  FINAL_PRESTIGE_XP,
  type RenownUnlock,
  getBounty,
  getLevel,
  getLevelFormatted,
  getPrestige,
  getPrestigeReq,
  getRenownShopCost,
} from "./util.js";
import { AssistsSchema, ExpSchema, KillsStats } from "../common.js";
import { type ExtractGameModes, FormattedGame, GameModes } from "#game";
import { ProgressionSchema, progression } from "../../../progression.definition.js";
import { add } from "@statsify/math";
import { formats } from "#definition/format";
import { s } from "#definition/s";
import type { APIData } from "@statsify/util";

export const PIT_MODES = new GameModes([
  { api: "overall" },
  { hypixel: "PIT", formatted: "Pit" },
] as const);

export type PitModes = ExtractGameModes<typeof PIT_MODES>;

/** The level counting every prestige as 120 levels */
const getTrueLevel = (exp: number) => {
  const prestige = getPrestige(exp);
  return prestige * 120 + getLevel(prestige, exp);
};

const formatLevel = (exp: number) => {
  const prestige = getPrestige(exp);
  return getLevelFormatted(getLevel(prestige, exp), prestige);
};

const formatNextLevel = (exp: number) => {
  const prestige = getPrestige(exp);
  return prestige === 50 ? getLevelFormatted(120, prestige) : getLevelFormatted(1, prestige + 1);
};

const levelProgression = (exp: number) => {
  const prestige = getPrestige(exp);
  const prestigeReq = getPrestigeReq(prestige);
  const lastPrestigeReq = getPrestigeReq(prestige - 1);

  // XP past the final requirement would push the progress bar over 100%
  return progression(
    Math.min(exp, prestigeReq) - lastPrestigeReq,
    Math.min(prestigeReq - lastPrestigeReq, FINAL_PRESTIGE_XP)
  );
};

const mysticsEnchanted = (name: string) =>
  s.number().leaderboard({ name: `${name} Mystics Enchanted`, fieldName: "Mystics Enchanted" });

const GoldStats = s.fields({
  gold() {
    return s
      .number()
      .color("§6")
      .leaderboard({ additionalFields: [this.goldEarned] });
  },
  goldEarned() {
    return s
      .number()
      .color("§6")
      .leaderboard({ additionalFields: [this.gold] });
  },
});

export const PitSchema = s
  .object({
    exp() {
      return ExpSchema.format(formats.searchedAs(getTrueLevel, formatLevel)).leaderboard({
        fieldName: "Level",
        hidden: true,
        additionalFields: [this.kills, this.playtime],
      });
    },
    trueLevel() {
      return s.number().computed(getTrueLevel, [this.exp]).subtractInSessions().leaderboard(false);
    },
    levelFormatted() {
      return s.string().computed(formatLevel, [this.exp]);
    },
    nextLevelFormatted() {
      return s.string().computed(formatNextLevel, [this.exp]);
    },
    progression() {
      return ProgressionSchema.computed(levelProgression, [this.exp]);
    },
    ...GoldStats,
    renown: s.number().color("§e"),
    lifetimeRenown: s.number().color("§b"),
    bounty: s.number().color("§6"),
    contractsCompleted: s.number().color("§a"),
    ...KillsStats,
    assists: AssistsSchema.color("§e"),
    tier1MysticsEnchanted: mysticsEnchanted("Tier I"),
    tier2MysticsEnchanted: mysticsEnchanted("Tier II"),
    tier3MysticsEnchanted: mysticsEnchanted("Tier III"),
    totalMysticsEnchanted: mysticsEnchanted("Total"),
    playtime: s.number().color("§b").format(formats.time),
    highestStreak: s.number().color("§d"),
    joins: s.number(),
    ragePotatoesEaten: s.number(),
    goldIngotsGathered: s.number(),
    blocksPlaced: s.number().color("§9"),
    vampireHealing: s.number(),
  })
  .leaderboard((pit) => ({
    fieldName: FormattedGame.PIT,
    extraDisplay: pit.levelFormatted,
  }));

export type Pit = s.infer<typeof PitSchema>;

export function pit(profile: APIData = {}, data: APIData = {}): s.input<typeof PitSchema> {
  const renownUnlocks = (profile.renown_unlocks ?? []) as RenownUnlock[];
  const renownShopCost = getRenownShopCost(
    renownUnlocks.filter((unlock) => unlock.key !== "unlock_golden_pickaxe")
  );

  return {
    exp: profile.xp ?? 0,
    gold: profile.cash,
    goldEarned: data.cash_earned,
    renown: profile.renown,
    lifetimeRenown: add(renownShopCost, profile.renown, 2 * (data.dark_pants_crated ?? 0)),
    bounty: getBounty(profile.bounties),
    contractsCompleted: data.contracts_completed,
    kills: data.kills,
    deaths: data.deaths,
    assists: data.assists,
    tier1MysticsEnchanted: data.enchanted_tier1,
    tier2MysticsEnchanted: data.enchanted_tier2,
    tier3MysticsEnchanted: data.enchanted_tier3,
    totalMysticsEnchanted: add(data.enchanted_tier1, data.enchanted_tier2, data.enchanted_tier3),
    playtime: (data.playtime_minutes ?? 0) * 60 * 1000,
    highestStreak: data.max_streak,
    joins: data.joins,
    ragePotatoesEaten: data.rage_potatoes_eaten,
    goldIngotsGathered: data.ingots_picked_up,
    blocksPlaced: data.blocks_placed,
    vampireHealing: data.vampire_healed_hp,
  };
}
