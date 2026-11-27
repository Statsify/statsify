/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { getAccessories } from "./accessories.js";
import { getApiSettings } from "../api-settings.js";
import { gameModeOf } from "../profiles.js";
import { getDungeons } from "./dungeons.js";
import { getHotm } from "./hotm.js";
import { getSkyBlockLevel } from "./level.js";
import { getPets } from "./pets.js";
import { getSkills } from "./skills.js";
import { getSlayers } from "./slayers.js";
import { RawMember, type RawMuseum, type RawMuseumMember, type RawProfile } from "#raw";
import type { ItemsResource, MemberView, PriceMap } from "#types";

export type SectionNeed = "museum" | "prices" | "items";

export interface SectionInput {
  uuid: string;
  profile: RawProfile;
  member: RawMember;
  museum?: RawMuseumMember;
  prices?: PriceMap;
  items?: ItemsResource;
}

interface Section<K extends keyof MemberView> {
  needs: readonly SectionNeed[];
  compute(input: SectionInput): Promise<MemberView[K]>;
}

/** Ironman, stranded and bingo profiles can't use the Auction House or the Bazaar. */
const hasMarket = (profile: RawProfile) => gameModeOf(profile) === "normal";

export type SectionKey = "accessories" | "dungeons" | "hotm" | "level" | "pets" | "skills" | "slayers";

type MemberKeys = { [K in keyof RawMember]?: true };

/** The member's keys each section reads. */
const READS: { [K in SectionKey]: MemberKeys } = {
  accessories: { accessory_bag_storage: true, inventory: true, nether_island_player_data: true, rift: true },
  dungeons: { dungeons: true },
  hotm: { mining_core: true, skill_tree: true },
  level: { accessory_bag_storage: true, inventory: true, leveling: true, nether_island_player_data: true, pets_data: true, rift: true },
  pets: { pets_data: true },
  skills: { jacobs_contest: true, pets_data: true, player_data: true, profile: true },
  slayers: { slayer: true },
};

/** The keys a section reads of the co-op's other members, when it reads any. */
const COOP_READS: { [K in SectionKey]?: MemberKeys } = {
  skills: { player_data: true, profile: true },
};

/**
 * Checks the member's `keys` and the other members' `coopKeys` before computing the section, so a malformed key fails
 * only the sections that read it.
 */
export function checkReads<K extends keyof MemberView>(section: Section<K>, keys: MemberKeys, coopKeys?: MemberKeys): Section<K> {
  const own = RawMember.pick(keys);
  const coop = coopKeys && RawMember.pick(coopKeys);
  return {
    needs: section.needs,
    compute: async (input) => {
      own.parse(input.member);
      if (coop) for (const [uuid, member] of Object.entries(input.profile.members)) if (uuid !== input.uuid) coop.parse(member);
      return section.compute(input);
    },
  };
}

const DEFINITIONS: { [K in SectionKey]: Section<K> } = {
  accessories: {
    needs: ["prices", "items"],
    compute: async ({ profile, member, items, prices }) => {
      if (!items || !prices) throw new TypeError("accessories needs prices and items");
      return getAccessories(member, items, prices, hasMarket(profile));
    },
  },
  dungeons: { needs: [], compute: async ({ member }) => getDungeons(member) },
  hotm: { needs: [], compute: async ({ member }) => getHotm(member) },
  level: {
    needs: ["prices", "items"],
    compute: async ({ profile, member, items, prices }) => {
      if (!items || !prices) throw new TypeError("level needs prices and items");
      return getSkyBlockLevel(member, items, prices, hasMarket(profile));
    },
  },
  pets: { needs: ["items"], compute: async ({ member, items }) => getPets(member, items) },
  skills: { needs: [], compute: async ({ profile, member }) => getSkills(profile, member) },
  slayers: { needs: [], compute: async ({ member }) => getSlayers(member) },
};

/** The caller fetches each section's needs before compute(). */
export const SECTIONS = Object.fromEntries(
  (Object.keys(DEFINITIONS) as SectionKey[]).map((name) => [name, checkReads(DEFINITIONS[name], READS[name], COOP_READS[name])])
) as typeof DEFINITIONS;

/** museum is the whole museum response, when it was fetched. */
export async function toMemberView<K extends keyof MemberView>(
  input: SectionInput,
  sections: readonly K[],
  compute: (name: K) => Promise<MemberView[K]>,
  museum?: RawMuseum
): Promise<MemberView> {
  const computed = await Promise.all(sections.map(async (name) => [name, await compute(name)] as const));
  return { apiSettings: getApiSettings(input.profile, input.member, museum), ...Object.fromEntries(computed) };
}

if (import.meta.vitest) {
  const { test, expect } = import.meta.vitest;

  test("a malformed member key fails only the sections that read it", async () => {
    const member = { slayer: { slayer_bosses: { zombie: { xp: "100" } } } } as unknown as RawMember;
    const input = { uuid: "a", profile: { profile_id: "p", cute_name: "Apple", members: { a: member } }, member };

    await expect(SECTIONS.slayers.compute(input)).rejects.toThrow("slayer_bosses");
    await expect(SECTIONS.dungeons.compute(input)).resolves.toBeDefined();
  });
}
