/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { AVERAGED, xpOf } from "./sections/skills.js";
import {
  DUNGEON_CLASSES,
  type DungeonClass,
  KUUDRA_TIERS,
  type Level,
  type MemberView,
  SKILLS,
  SLAYER_BOSSES,
  type Skill,
  type SlayerBoss,
} from "#types";
import { add } from "@statsify/math";
import { bagAccessories } from "./sections/accessories.js";
import { isMember, toProfileSummary } from "./profiles.js";
import type { SectionInput, SkyBlockSection } from "./sections/index.js";

/** The sections a member's stats come from; the level and fairy souls are the profile summary's. */
export const MEMBER_STATS_SECTIONS = [
  "chocolate",
  "crimson",
  "dungeons",
  "fishing",
  "hotm",
  "networth",
  "pets",
  "skills",
  "slayers",
] as const satisfies readonly SkyBlockSection[];

const KUUDRA_STATS = {
  none: "kuudraBasic",
  hot: "kuudraHot",
  burning: "kuudraBurning",
  fiery: "kuudraFiery",
  infernal: "kuudraInfernal",
} as const satisfies Record<(typeof KUUDRA_TIERS)[number], string>;

// The page's Social is the co-op's sum and level, so its board ranks the member's own XP, with no level
type LeveledSkill = Exclude<Skill, "social">;
const LEVELED_SKILLS = SKILLS.filter((skill): skill is LeveledSkill => skill !== "social");

export type MemberStat =
  | "xp"
  | "level"
  | "networth"
  | "nonCosmeticNetworth"
  | "skillAverage"
  | "skillAverageOrder"
  | `${Skill}Xp`
  | `${LeveledSkill}Level`
  | "catacombsXp"
  | "catacombsLevel"
  | `${DungeonClass}Xp`
  | `${DungeonClass}Level`
  | "secrets"
  | "slayerXp"
  | `${SlayerBoss}Xp`
  | `${SlayerBoss}Level`
  | (typeof KUUDRA_STATS)[keyof typeof KUUDRA_STATS]
  | "hotmXp"
  | "hotmLevel"
  | "accessoryPower"
  | "petScore"
  | "fairySouls"
  | "trophyFish"
  | "chocolate";

/** A member's numbers at a fetch, as their profile page shows them, except for what a co-op shares. */
export type MemberStats = Record<MemberStat, number>;

// 13 bits hold the average in hundredths (60.00 at most) and 40 the XP, so the score stays an exact integer
const XP_SPAN = 2 ** 40;

/** The skill average board's score: the average as shown, to two decimals, then the averaged skills' XP. */
export const skillAverageOrder = (average: number, xp: number) =>
  Math.round(average * 100) * XP_SPAN + Math.min(Math.floor(xp), XP_SPAN - 1);

// The page counts Catacombs and class levels past 50; the boards show the game's
const cappedLevel = ({ level, maxLevel }: Level) => Math.min(level, maxLevel);

/**
 * A section left out of `view` leaves its numbers out, so a caller can keep the ones it had; a section the API settings
 * hide counts 0. What a co-op shares counts the member's own part: their own Social XP, and their share of the bank.
 */
export function toMemberStats(
  { uuid, profile, member, items, prices }: Pick<SectionInput, "uuid" | "profile" | "member" | "items" | "prices">,
  view: MemberView
): Partial<MemberStats> {
  const { chocolate, crimson, dungeons, fishing, hotm, networth, pets, skills, slayers } = view;
  const summary = toProfileSummary(profile, uuid);
  const stats: Partial<MemberStats> = { xp: summary.xp, level: summary.level, fairySouls: summary.fairySouls };

  if (networth) {
    const members = Object.keys(profile.members).filter((other) => isMember(profile, other)).length;
    const othersBank = networth.bank - networth.bank / members;
    stats.networth = networth.noInventory ? 0 : Math.floor(networth.total - othersBank);
    stats.nonCosmeticNetworth = networth.noInventory ? 0 : Math.floor(networth.nonCosmetic.total - othersBank);
  }

  if (skills !== undefined) {
    const averagedXp = skills ? add(...AVERAGED.map((skill) => skills.skills[skill].xp)) : 0;
    stats.skillAverage = skills?.average ?? 0;
    stats.skillAverageOrder = skillAverageOrder(stats.skillAverage, averagedXp);

    for (const skill of LEVELED_SKILLS) {
      stats[`${skill}Xp`] = Math.floor(skills?.skills[skill].xp ?? 0);
      stats[`${skill}Level`] = skills?.skills[skill].level ?? 0;
    }

    stats.socialXp = skills ? Math.floor(xpOf(member, "social")) : 0;
  }

  if (dungeons) {
    stats.catacombsXp = Math.floor(dungeons.catacombs.xp);
    stats.catacombsLevel = cappedLevel(dungeons.catacombs);

    for (const name of DUNGEON_CLASSES) {
      stats[`${name}Xp`] = Math.floor(dungeons.classes[name].xp);
      stats[`${name}Level`] = cappedLevel(dungeons.classes[name]);
    }

    stats.secrets = dungeons.secrets;
  }

  if (slayers) {
    stats.slayerXp = slayers.xp;

    for (const boss of SLAYER_BOSSES) {
      stats[`${boss}Xp`] = slayers.bosses[boss].level.xp;
      stats[`${boss}Level`] = slayers.bosses[boss].level.level;
    }
  }

  if (crimson !== undefined) {
    for (const tier of KUUDRA_TIERS) {
      stats[KUUDRA_STATS[tier]] = crimson?.kuudra.find((kuudra) => kuudra.tier === tier)?.completions ?? 0;
    }
  }

  if (hotm) {
    stats.hotmXp = Math.floor(hotm.level.xp);
    stats.hotmLevel = hotm.level.level;
  }

  // The bag alone, without the accessories section's stored items and upgrades. It waits for prices as that section
  // does, so the board and the page agree
  if (items && prices) stats.accessoryPower = bagAccessories(member, items)?.accessoryPower ?? 0;
  if (pets) stats.petScore = pets.score;
  if (fishing !== undefined) stats.trophyFish = fishing?.trophyFishCaught ?? 0;
  if (chocolate !== undefined) stats.chocolate = chocolate?.total ?? 0;

  return stats;
}

if (import.meta.vitest) {
  const { test, expect } = import.meta.vitest;

  test("skillAverageOrder ranks by the shown average, then by the XP under it", () => {
    expect(skillAverageOrder(55.7, 0)).toBeGreaterThan(skillAverageOrder(55.69, 1e11));
    expect(skillAverageOrder(55.704, 2)).toBeGreaterThan(skillAverageOrder(55.696, 1));
    expect(skillAverageOrder(55.7, 1e13)).toBe(skillAverageOrder(55.7, 2 ** 40));
    expect(Number.isSafeInteger(skillAverageOrder(60, 1e13))).toBe(true);
  });
}
