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
import type { ItemsResource, MemberView, PriceMap } from "#types";
import type { RawGarden, RawMember, RawMuseum, RawMuseumMember, RawProfile } from "#raw";

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
const hasMarket = (profile: RawProfile) => gameModeOf(profile) === "normal";

export type SectionKey = Exclude<keyof MemberView, "apiSettings" | "networth" | "values">;

/** The caller fetches each section's needs before compute(). */
export const SECTIONS: { [K in SectionKey]: Section<K> } = {
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
  pets: { needs: ["items"], compute: async ({ member, items }) => getPets(member, items) },
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
