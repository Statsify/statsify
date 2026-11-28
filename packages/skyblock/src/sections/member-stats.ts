/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { AVERAGED, SKILLS, type Skill, getSkillXp } from "./skills.js";
import { DUNGEON_CLASSES, type DungeonClass } from "./dungeons.js";
import { KUUDRA_TIERS, type Level, type MemberView } from "#types";
import { SLAYER_BOSSES, type SlayerBoss } from "./slayers.js";
import { add } from "@statsify/math";
import { isMember, toProfileSummary } from "../profiles.js";
import { readBag } from "./accessories.js";
import type { SectionInput, SkyBlockSection } from "./index.js";

// The level and fairy souls come from the profile summary instead.
export const MEMBER_STATS_SECTIONS: SkyBlockSection[] = [
  "chocolate",
  "crimson",
  "dungeons",
  "fishing",
  "hotm",
  "networth",
  "pets",
  "skills",
  "slayers",
];

const KUUDRA_STATS = {
  none: "kuudraBasic",
  hot: "kuudraHot",
  burning: "kuudraBurning",
  fiery: "kuudraFiery",
  infernal: "kuudraInfernal",
} as const satisfies Record<(typeof KUUDRA_TIERS)[number], string>;

// The page's Social is the co-op's, so its board ranks the member's own XP.
type LeveledSkill = Exclude<Skill, "social">;
const LEVELED_SKILLS = SKILLS.filter(
  (skill): skill is LeveledSkill => skill !== "social",
);

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

export type MemberStats = Record<MemberStat, number>;

// 13 bits hold the average in hundredths and 40 the XP, an exact integer.
const XP_SPAN = 2 ** 40;

// Maxed members tie on the shown average, so the XP under it breaks ties.
export const getSkillAverageOrder = (average: number, xp: number) =>
  Math.round(average * 100) * XP_SPAN + Math.min(Math.floor(xp), XP_SPAN - 1);

// The page counts Catacombs and class levels past 50, but the boards don't.
const getCappedLevel = ({ level, maxLevel }: Level) =>
  Math.min(level, maxLevel);

// A section left out of the view leaves its stats out, so stored ones stay.
export function toMemberStats(
  {
    uuid,
    profile,
    member,
    items,
    prices,
  }: Pick<SectionInput, "uuid" | "profile" | "member" | "items" | "prices">,
  view: MemberView,
): Partial<MemberStats> {
  const {
    chocolate,
    crimson,
    dungeons,
    fishing,
    hotm,
    networth,
    pets,
    skills,
    slayers,
  } = view;
  const summary = toProfileSummary(profile, uuid);
  const stats: Partial<MemberStats> = {
    xp: summary.xp,
    level: summary.level,
    fairySouls: summary.fairySouls,
  };

  if (networth) {
    const members = Object.keys(profile.members).filter((other) =>
      isMember(profile, other),
    ).length;
    const othersBank = networth.bank - networth.bank / members;
    stats.networth = networth.noInventory
      ? 0
      : Math.floor(networth.total - othersBank);
    stats.nonCosmeticNetworth = networth.noInventory
      ? 0
      : Math.floor(networth.nonCosmetic.total - othersBank);
  }

  if (skills !== undefined) {
    const averagedXp = skills
      ? add(...AVERAGED.map((skill) => skills.skills[skill].xp))
      : 0;
    stats.skillAverage = skills?.average ?? 0;
    stats.skillAverageOrder = getSkillAverageOrder(
      stats.skillAverage,
      averagedXp,
    );

    for (const skill of LEVELED_SKILLS) {
      stats[`${skill}Xp`] = Math.floor(skills?.skills[skill].xp ?? 0);
      stats[`${skill}Level`] = skills?.skills[skill].level ?? 0;
    }

    stats.socialXp = skills ? Math.floor(getSkillXp(member, "social")) : 0;
  }

  if (dungeons) {
    stats.catacombsXp = Math.floor(dungeons.catacombs.xp);
    stats.catacombsLevel = getCappedLevel(dungeons.catacombs);

    for (const name of DUNGEON_CLASSES) {
      stats[`${name}Xp`] = Math.floor(dungeons.classes[name].xp);
      stats[`${name}Level`] = getCappedLevel(dungeons.classes[name]);
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
      const kuudra = crimson?.kuudra.find((entry) => entry.tier === tier);
      stats[KUUDRA_STATS[tier]] = kuudra?.completions ?? 0;
    }
  }

  if (hotm) {
    stats.hotmXp = Math.floor(hotm.level.xp);
    stats.hotmLevel = hotm.level.level;
  }

  // It waits for prices like the accessories section, so the two agree.
  if (items && prices) {
    stats.accessoryPower = readBag(member, items)?.accessoryPower ?? 0;
  }

  if (pets) stats.petScore = pets.score;
  if (fishing !== undefined) stats.trophyFish = fishing?.trophyFishCaught ?? 0;
  if (chocolate !== undefined) stats.chocolate = chocolate?.total ?? 0;

  return stats;
}

if (import.meta.vitest) {
  const { suite, it, expect } = import.meta.vitest;

  suite("getSkillAverageOrder", () => {
    it("should rank by the shown average first", () => {
      expect(getSkillAverageOrder(55.7, 0)).toBeGreaterThan(
        getSkillAverageOrder(55.69, 1e11),
      );
      expect(getSkillAverageOrder(55.704, 2)).toBeGreaterThan(
        getSkillAverageOrder(55.696, 1),
      );
    });

    it("should cap the XP so the score stays an exact integer", () => {
      expect(getSkillAverageOrder(55.7, 1e13)).toBe(
        getSkillAverageOrder(55.7, 2 ** 40),
      );
      expect(Number.isSafeInteger(getSkillAverageOrder(60, 1e13))).toBe(true);
    });
  });
}
