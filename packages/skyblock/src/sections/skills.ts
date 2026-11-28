/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { LEVELING } from "#data";
import { add } from "@statsify/math";
import { fractionalLevel, getLevel } from "#leveling";
import type { RawMember, RawProfile } from "#raw";
import type { SkillLevel, SkillsSection } from "#types";

export const SKILLS = [
  "farming",
  "mining",
  "combat",
  "foraging",
  "fishing",
  "enchanting",
  "alchemy",
  "taming",
  "carpentry",
  "hunting",
  "runecrafting",
  "social",
] as const;

export type Skill = (typeof SKILLS)[number];

// Runecrafting and Social are cosmetic, so the average leaves them out.
const AVERAGED = SKILLS.filter(
  (skill) => skill !== "runecrafting" && skill !== "social",
);

// Past 50 and the three log unlocks, the cap rests on the shop perks.
const FORAGING_VERIFIED = 53;

const getSkillXp = (member: RawMember, skill: Skill) =>
  member.player_data?.experience?.[`SKILL_${skill.toUpperCase()}`] ?? 0;

function getXpTable(skill: Skill) {
  if (skill === "runecrafting") return LEVELING.runecrafting_xp;
  if (skill === "social") return LEVELING.social;
  return LEVELING.leveling_xp;
}

function getLevelCap(skill: Skill, member: RawMember) {
  const cap = LEVELING.leveling_caps[skill];
  const max = LEVELING.max_levels[skill];

  if (skill === "farming") {
    const perk = member.jacobs_contest?.perks?.farming_level_cap ?? 0;
    return Math.min(cap + perk, max);
  }

  if (skill === "taming") {
    const sacrificed = member.pets_data?.pet_care?.pet_types_sacrificed ?? [];
    return Math.min(cap + sacrificed.length, max);
  }

  if (skill === "foraging") {
    const data = member.player_data;
    const unlocks = data?.experience?.SKILL_FORAGING_extra_level_cap ?? 0;
    const agatha = Number(data?.perks?.agatha_power ?? 0);
    const miria = Number(data?.perks?.miria_power ?? 0);
    // Agatha's Milestone IV raises the cap by two, and Miria's IV and V by one.
    const shops =
      2 * Number(agatha >= 4) + Number(miria >= 4) + Number(miria >= 5);
    return Math.min(50 + unlocks + shops, max);
  }

  return cap;
}

export function getSkills(
  profile: RawProfile,
  member: RawMember,
): SkillsSection | null {
  if (!member.player_data?.experience) return null;

  // Social XP is shared, so it sums every member who accepted the invite.
  const accepted = Object.values(profile.members).filter(
    (other) => other.profile?.coop_invitation?.confirmed !== false,
  );

  const skills = Object.fromEntries(
    SKILLS.map((skill): [string, SkillLevel] => {
      const xp =
        skill === "social"
          ? add(...accepted.map((other) => getSkillXp(other, skill)))
          : getSkillXp(member, skill);
      const level = getLevel(xp, getXpTable(skill), getLevelCap(skill, member));
      return [
        skill,
        {
          ...level,
          unverified: skill === "foraging" && level.level > FORAGING_VERIFIED,
        },
      ];
    }),
  ) as SkillsSection["skills"];

  const average =
    add(...AVERAGED.map((skill) => fractionalLevel(skills[skill]))) /
    AVERAGED.length;
  return { average, skills };
}
