/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { getAccessories } from "./accessories.js";
import { getDungeons } from "./dungeons.js";
import { getHotm } from "./hotm.js";
import { getPets } from "./pets.js";
import { getSkills } from "./skills.js";
import { getSlayers } from "./slayers.js";
import type { ApiSettings, ItemsResource, MemberView, PriceMap } from "#types";
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
  needs: SectionNeed[];
  compute(input: SectionInput): Promise<MemberView[K]>;
}

// The caller fetches what a section needs before it calls compute.
export const SECTIONS: {
  [K in Exclude<keyof MemberView, "apiSettings">]: Section<K>;
} = {
  accessories: {
    needs: ["prices", "items"],
    compute: async ({ member, items, prices }) => {
      if (!items || !prices) {
        throw new TypeError("accessories needs prices and items");
      }

      return getAccessories(member, items, prices);
    },
  },
  dungeons: { needs: [], compute: async ({ member }) => getDungeons(member) },
  hotm: { needs: [], compute: async ({ member }) => getHotm(member) },
  pets: {
    needs: ["items"],
    compute: async ({ member, items }) => getPets(member, items),
  },
  skills: {
    needs: [],
    compute: async ({ profile, member }) => getSkills(profile, member),
  },
  slayers: { needs: [], compute: async ({ member }) => getSlayers(member) },
};

export type SectionKey = keyof typeof SECTIONS;

export function getApiSettings(
  profile: RawProfile,
  member: RawMember,
  museum?: RawMuseum,
): ApiSettings {
  const settings: ApiSettings = {
    skills: member.player_data?.experience !== undefined,
    // With the inventory API off, inventory can still hold the sacks bag.
    inventory: member.inventory?.inv_contents !== undefined,
    personalVault: member.inventory?.personal_vault_contents !== undefined,
    collections: member.collection !== undefined,
    banking: profile.banking !== undefined,
  };

  if (!museum) return settings;

  // The museum keys members by the uuid without dashes.
  const uuid = member.player_id?.replaceAll("-", "");
  return {
    ...settings,
    museum: uuid !== undefined && museum.members?.[uuid] !== undefined,
  };
}
