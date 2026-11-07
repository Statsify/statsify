/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { LEVELING } from "#data";
import { SKILLS, type SkillLevel, type SkillsSection } from "#types";
import { add } from "@statsify/math";
import { fractionalLevel, getLevel } from "#leveling";
import type { RawMember, RawProfile } from "#raw";

// Runecrafting and social are cosmetic skills, so the average leaves them out; hunting counts.
export const AVERAGED = SKILLS.filter((skill) => skill !== "runecrafting" && skill !== "social");

export const xpOf = (member: RawMember, skill: string) => member.player_data?.experience?.[`SKILL_${skill.toUpperCase()}`] ?? 0;

const tableOf = (skill: string) =>
  skill === "runecrafting" ? LEVELING.runecrafting_xp : skill === "social" ? LEVELING.social : LEVELING.leveling_xp;

// 50, the log unlocks, then two levels each from Agatha's and Miria's shops (unverified). Hypixel's highest foraging
// level achievement fits it on every saved player: 57 with all three log unlocks, 54 with two and no Miria Power.
const foragingCap = (member: RawMember) => {
  const perks = member.player_data?.perks ?? {};
  const shops = 2 * Number((perks.agatha_power ?? 0) >= 4) + 2 * Number((perks.miria_power ?? 0) >= 4);
  return Math.min(50 + (member.player_data?.experience?.SKILL_FORAGING_extra_level_cap ?? 0) + shops, 57);
};

// SKILL_FORAGING_extra_level_cap looks like it counts the three log collection unlocks and not the shop's, so a level
// past 53 can't be confirmed from the API.
const FORAGING_VERIFIED = 53;

// Foraging is 54 plus SKILL_FORAGING_extra_level_cap, though NEU's leveling_caps still says 50.
function capOf(skill: string, member: RawMember) {
  const cap = LEVELING.leveling_caps[skill];
  const max = LEVELING.max_levels[skill];
  if (skill === "farming") return Math.min(cap + (member.jacobs_contest?.perks?.farming_level_cap ?? 0), max);
  if (skill === "taming") return Math.min(cap + (member.pets_data?.pet_care?.pet_types_sacrificed?.length ?? 0), max);
  if (skill === "foraging") return Math.min(foragingCap(member), max);
  return cap;
}

/**
 * null when the skills API is off. Social sums the XP of every member who accepted their invite, since the profile
 * shares it.
 */
export function getSkills(profile: RawProfile, member: RawMember): SkillsSection | null {
  if (!member.player_data?.experience) return null;

  const accepted = Object.values(profile.members).filter((other) => other.profile?.coop_invitation?.confirmed !== false);
  const skills = Object.fromEntries(
    SKILLS.map((skill): [string, SkillLevel] => {
      const xp = skill === "social" ? add(...accepted.map((other) => xpOf(other, skill))) : xpOf(member, skill);
      const level = getLevel(xp, tableOf(skill), capOf(skill, member));
      return [skill, { ...level, unverified: skill === "foraging" && level.level > FORAGING_VERIFIED }];
    })
  ) as SkillsSection["skills"];

  const average = add(...AVERAGED.map((skill) => fractionalLevel(skills[skill]))) / AVERAGED.length;
  return { average, skills };
}

if (import.meta.vitest) {
  const { test, expect } = import.meta.vitest;

  test("getSkills caps farming, taming and foraging per member, and sums social", () => {
    const member: RawMember = {
      player_data: {
        experience: {
          SKILL_FARMING: 1e12,
          SKILL_TAMING: 1e12,
          SKILL_FORAGING: 1e12,
          SKILL_FORAGING_extra_level_cap: 3,
          SKILL_RUNECRAFTING: 7340,
          SKILL_SOCIAL: 100,
        },
        perks: { agatha_power: 4 },
      },
      jacobs_contest: { perks: { farming_level_cap: 10 } },
      pets_data: { pet_care: { pet_types_sacrificed: ["A", "B", "C"] } },
    };
    const other: RawMember = { player_data: { experience: { SKILL_SOCIAL: 50 } } };
    const invited: RawMember = {
      player_data: { experience: { SKILL_SOCIAL: 1000 } },
      profile: { coop_invitation: { confirmed: false } },
    };
    const profile = { profile_id: "p", cute_name: "Apple", members: { a: member, b: other, c: invited } };
    const skills = getSkills(profile, member)?.skills;

    expect(skills?.farming).toMatchObject({ level: 60, maxLevel: 60 });
    expect(skills?.taming).toMatchObject({ level: 53, maxLevel: 53, unverified: false });
    expect(skills?.foraging).toMatchObject({ level: 55, maxLevel: 55, unverified: true });
    expect(skills?.runecrafting.level).toBe(14);
    expect(skills?.social).toMatchObject({ level: 2, xp: 150 });

    const forager = { player_data: { experience: { SKILL_FORAGING: 55_172_425 } } };
    expect(getSkills(profile, forager)?.skills.foraging).toMatchObject({ level: 50, unverified: false });
    expect(getSkills({ profile_id: "p", cute_name: "Apple", members: {} }, {})).toBeNull();
  });
}
