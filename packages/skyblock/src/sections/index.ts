/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { getAccessories } from "./accessories.js";
import { getApiSettings } from "../api-settings.js";
import { getDungeons } from "./dungeons.js";
import { getHotm } from "./hotm.js";
import { getPets } from "./pets.js";
import { getSkills } from "./skills.js";
import { getSlayers } from "./slayers.js";
import type { ItemsResource, MemberView, PriceMap } from "#types";
import type { RawMember, RawMuseum, RawMuseumMember, RawProfile } from "#raw";

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

export type SectionKey = "accessories" | "dungeons" | "hotm" | "pets" | "skills" | "slayers";

/** The caller fetches each section's needs before compute(). */
export const SECTIONS: { [K in SectionKey]: Section<K> } = {
  accessories: {
    needs: ["prices", "items"],
    compute: async ({ member, items, prices }) => {
      if (!items || !prices) throw new TypeError("accessories needs prices and items");
      return getAccessories(member, items, prices);
    },
  },
  dungeons: { needs: [], compute: async ({ member }) => getDungeons(member) },
  hotm: { needs: [], compute: async ({ member }) => getHotm(member) },
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
