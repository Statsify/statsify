/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { getAccessories } from "./accessories.js";
import { getApiSettings } from "../api-settings.js";
import { getAttributes } from "./attributes.js";
import { getBestiary } from "./bestiary.js";
import { getChocolate } from "./chocolate.js";
import { getCollections } from "./collections.js";
import { getCrimson } from "./crimson.js";
import { gameModeOf } from "../profiles.js";
import { getDungeons } from "./dungeons.js";
import { getExperiments } from "./experiments.js";
import { getFishing } from "./fishing.js";
import { getGarden } from "./garden.js";
import { getGear } from "./gear.js";
import { getInventories } from "./inventories.js";
import { getHotf } from "./hotf.js";
import { getHotm } from "./hotm.js";
import { getJacob } from "./jacob.js";
import { getMinions } from "./minions.js";
import { getMisc } from "./misc.js";
import { getSkyBlockLevel } from "./level.js";
import { getMuseum } from "./museum.js";
import { getPets } from "./pets.js";
import { getRift } from "./rift.js";
import { getSkills } from "./skills.js";
import { getSlayers } from "./slayers.js";
import { getStats } from "./stats.js";
import { type RawGarden, RawMember, type RawMuseum, type RawMuseumMember, type RawProfile } from "#raw";
import type { ItemsResource, MemberView, PriceMap } from "#types";

export type SectionNeed = "museum" | "garden" | "prices" | "items";

/** Every section a lookup can ask for: SECTIONS' and networth and values, which ./networth computes. */
export const SKYBLOCK_SECTIONS = [
  "accessories",
  "attributes",
  "bestiary",
  "chocolate",
  "collections",
  "crimson",
  "dungeons",
  "experiments",
  "fishing",
  "garden",
  "gear",
  "hotf",
  "hotm",
  "inventories",
  "jacob",
  "level",
  "minions",
  "misc",
  "museum",
  "networth",
  "pets",
  "rift",
  "skills",
  "slayers",
  "stats",
  "values",
] as const;

export type SkyBlockSection = (typeof SKYBLOCK_SECTIONS)[number];

export interface SectionInput {
  uuid: string;
  profile: RawProfile;
  member: RawMember;
  museum?: RawMuseumMember;
  garden?: RawGarden | null; // null: Hypixel has no Garden for the profile
  prices?: PriceMap;
  items?: ItemsResource;
  ranked?: boolean; // false only for a player known to have no rank
}

interface Section<K extends keyof MemberView> {
  needs: readonly SectionNeed[];
  compute(input: SectionInput): Promise<MemberView[K]>;
}

/** Ironman, stranded and bingo profiles can't use the Auction House or the Bazaar. */
export const hasMarket = (profile: RawProfile) => gameModeOf(profile) === "normal";

export type SectionKey = Exclude<keyof MemberView, "apiSettings" | "networth" | "values">;

type MemberKeys = { [K in keyof RawMember]?: true };

/** The member's keys each section reads. */
const READS: { [K in SectionKey]: MemberKeys } = {
  accessories: {
    accessory_bag_storage: true,
    attributes: true,
    bestiary: true,
    inventory: true,
    leveling: true,
    nether_island_player_data: true,
    rift: true,
  },
  attributes: { attributes: true, shards: true },
  bestiary: { bestiary: true },
  chocolate: { events: true },
  collections: { collection: true, dungeons: true, nether_island_player_data: true, player_data: true, profile: true },
  crimson: { bestiary: true, nether_island_player_data: true },
  dungeons: { currencies: true, dungeons: true, glacite_player_data: true, player_data: true },
  experiments: { experimentation: true },
  fishing: { bestiary: true, leveling: true, player_stats: true, trophy_fish: true },
  garden: { garden_player_data: true },
  gear: { accessory_bag_storage: true, inventory: true, loadout: true },
  hotf: { foraging_core: true, skill_tree: true },
  hotm: { glacite_player_data: true, mining_core: true, skill_tree: true },
  inventories: { foraging: true, garden_player_data: true, inventory: true, rift: true },
  jacob: { jacobs_contest: true },
  level: {
    accessory_bag_storage: true,
    attributes: true,
    bestiary: true,
    inventory: true,
    leveling: true,
    nether_island_player_data: true,
    pets_data: true,
    player_stats: true,
    rift: true,
  },
  minions: { player_data: true, profile: true },
  misc: {
    bestiary: true,
    events: true,
    experimentation: true,
    foraging: true,
    garden_player_data: true,
    item_data: true,
    player_data: true,
    player_stats: true,
    quests: true,
    rift: true,
    winter_player_data: true,
  },
  museum: {},
  pets: { pets_data: true, player_stats: true, rift: true },
  rift: { currencies: true, player_stats: true, rift: true },
  skills: { jacobs_contest: true, pets_data: true, player_data: true, profile: true },
  slayers: { slayer: true },
  stats: {
    accessory_bag_storage: true,
    attributes: true,
    bestiary: true,
    currencies: true,
    dungeons: true,
    foraging_core: true,
    glacite_player_data: true,
    inventory: true,
    jacobs_contest: true,
    leveling: true,
    mining_core: true,
    nether_island_player_data: true,
    pets_data: true,
    player_data: true,
    player_stats: true,
    profile: true,
    rift: true,
    skill_tree: true,
    slayer: true,
  },
};

/** The keys a section reads of the co-op's other members, when it reads any. */
const COOP_READS: { [K in SectionKey]?: MemberKeys } = {
  collections: { collection: true, profile: true },
  minions: { player_data: true, profile: true },
  skills: { player_data: true, profile: true },
  stats: { player_data: true, profile: true },
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
  attributes: { needs: [], compute: async ({ member }) => getAttributes(member) },
  bestiary: { needs: [], compute: async ({ member }) => getBestiary(member) },
  chocolate: { needs: [], compute: async ({ member }) => getChocolate(member) },
  collections: { needs: ["items"], compute: async ({ profile, member, items }) => getCollections(profile, member, items) },
  crimson: { needs: [], compute: async ({ member }) => getCrimson(member) },
  dungeons: { needs: [], compute: async ({ member }) => getDungeons(member) },
  experiments: { needs: [], compute: async ({ member }) => getExperiments(member) },
  fishing: { needs: [], compute: async ({ member }) => getFishing(member) },
  garden: {
    needs: ["garden", "items"],
    compute: async ({ member, garden, items }) => {
      if (!items) throw new TypeError("garden needs items");
      return getGarden(member, garden, items);
    },
  },
  gear: { needs: [], compute: async ({ member }) => getGear(member) },
  hotf: { needs: [], compute: async ({ member }) => getHotf(member) },
  hotm: { needs: [], compute: async ({ member }) => getHotm(member) },
  inventories: {
    needs: ["items"],
    compute: async ({ member, items }) => {
      if (!items) throw new TypeError("inventories needs items");
      return getInventories(member, items);
    },
  },
  jacob: { needs: ["items"], compute: async ({ member, items }) => getJacob(member, items) },
  level: {
    needs: ["prices", "items"],
    compute: async ({ profile, member, items, prices }) => {
      if (!items || !prices) throw new TypeError("level needs prices and items");
      return getSkyBlockLevel(member, items, prices, hasMarket(profile));
    },
  },
  minions: {
    needs: ["items"],
    compute: async ({ profile, items }) => {
      if (!items) throw new TypeError("minions needs items");
      return getMinions(profile, items);
    },
  },
  misc: {
    needs: ["items"],
    compute: async ({ profile, member, items }) => {
      if (!items) throw new TypeError("misc needs items");
      return getMisc(profile, member, items);
    },
  },
  museum: {
    needs: ["items", "museum"],
    compute: async ({ items, museum }) => {
      if (!items) throw new TypeError("museum needs items");
      return getMuseum(museum, items);
    },
  },
  pets: {
    needs: ["items"],
    compute: async ({ member, items }) => getPets(member, items),
  },
  rift: { needs: [], compute: async ({ member }) => getRift(member) },
  skills: { needs: [], compute: async ({ profile, member, ranked }) => getSkills(profile, member, ranked) },
  slayers: { needs: [], compute: async ({ member }) => getSlayers(member) },
  stats: {
    needs: ["items"],
    compute: async ({ profile, member, items }) => {
      if (!items) throw new TypeError("stats needs items");
      return getStats(profile, member, items);
    },
  },
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
