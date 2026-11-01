/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { getAccessories } from "./accessories.js";
import { getApiSettings } from "../api-settings.js";
import { getCrimson } from "./crimson.js";
import { gameModeOf } from "../profiles.js";
import { getDungeons } from "./dungeons.js";
import { getHotm } from "./hotm.js";
import { getSkyBlockLevel } from "./level.js";
import { getPets } from "./pets.js";
import { getSkills } from "./skills.js";
import { getSlayers } from "./slayers.js";
import type { ItemsResource, MemberView, PriceMap } from "#types";
import type { RawMember, RawMuseum, RawMuseumMember, RawProfile } from "#raw";

export type SectionNeed = "museum" | "prices" | "items";

/** Every section a lookup can ask for: SECTIONS' and networth, which ./networth computes. */
export const SKYBLOCK_SECTIONS = [
  "accessories",
  "crimson",
  "dungeons",
  "hotm",
  "level",
  "networth",
  "pets",
  "skills",
  "slayers",
] as const;

export type SkyBlockSection = (typeof SKYBLOCK_SECTIONS)[number];

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

export type SectionKey =
  | "accessories"
  | "crimson"
  | "dungeons"
  | "hotm"
  | "level"
  | "pets"
  | "skills"
  | "slayers";

/** The caller fetches each section's needs before compute(). */
export const SECTIONS: { [K in SectionKey]: Section<K> } = {
  accessories: {
    needs: ["prices", "items"],
    compute: async ({ profile, member, items, prices }) => {
      if (!items || !prices) throw new TypeError("accessories needs prices and items");
      return getAccessories(member, items, prices, hasMarket(profile));
    },
  },
  crimson: { needs: [], compute: async ({ member }) => getCrimson(member) },
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
