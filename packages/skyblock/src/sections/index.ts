/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { getAccessories } from "./accessories.js";
import { getChocolate } from "./chocolate.js";
import { getCrimson } from "./crimson.js";
import { getDungeons } from "./dungeons.js";
import { getExperiments } from "./experiments.js";
import { getFishing } from "./fishing.js";
import { getGarden } from "./garden.js";
import { getGear } from "./gear.js";
import { getInventories } from "./inventories.js";
import { getHotf } from "./hotf.js";
import { getHotm } from "./hotm.js";
import { getJacob } from "./jacob.js";
import { getMisc } from "./misc.js";
import { getSkyBlockLevel } from "./level.js";
import { getMuseum } from "./museum.js";
import { getPets } from "./pets.js";
import { getRift } from "./rift.js";
import { getSkills } from "./skills.js";
import { getSlayers } from "./slayers.js";
import { hasMarket } from "../profiles.js";
import type { ApiSettings, ItemsResource, MemberView, PriceMap } from "#types";
import type {
  RawGarden,
  RawItemsResource,
  RawMember,
  RawMuseum,
  RawMuseumMember,
  RawProfile,
} from "#raw";

export type SectionNeed = "museum" | "garden" | "prices" | "items";

export interface SectionInput {
  uuid: string;
  profile: RawProfile;
  member: RawMember;
  museum?: RawMuseumMember;
  // The Garden is null when the profile has none.
  garden?: RawGarden | null;
  prices?: PriceMap;
  items?: ItemsResource;
  rawItems?: RawItemsResource;
}

export interface Section<K extends keyof MemberView> {
  needs: SectionNeed[];
  compute(input: SectionInput): Promise<MemberView[K]>;
}

// Networth is computed by ./networth, which keeps its library out of here.
export const NETWORTH_SECTION = "networth";

// The caller fetches what a section needs before it calls compute.
export const SECTIONS: {
  [K in Exclude<
    keyof MemberView,
    "apiSettings" | typeof NETWORTH_SECTION
  >]: Section<K>;
} = {
  accessories: {
    needs: ["prices", "items"],
    compute: async ({ profile, member, items, prices }) => {
      if (!items || !prices) {
        throw new TypeError("accessories needs prices and items");
      }

      return getAccessories(member, items, prices, hasMarket(profile));
    },
  },
  chocolate: {
    needs: [],
    compute: async ({ member }) => getChocolate(member),
  },
  crimson: { needs: [], compute: async ({ member }) => getCrimson(member) },
  dungeons: { needs: [], compute: async ({ member }) => getDungeons(member) },
  experiments: {
    needs: [],
    compute: async ({ member }) => getExperiments(member),
  },
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
  jacob: {
    needs: ["items"],
    compute: async ({ member, items }) => getJacob(member, items),
  },
  level: {
    needs: ["prices", "items"],
    compute: async ({ profile, member, items, prices }) => {
      if (!items || !prices)
        throw new TypeError("level needs prices and items");
      return getSkyBlockLevel(member, items, prices, hasMarket(profile));
    },
  },
  misc: { needs: [], compute: async ({ member }) => getMisc(member) },
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
  skills: {
    needs: [],
    compute: async ({ profile, member }) => getSkills(profile, member),
  },
  slayers: { needs: [], compute: async ({ member }) => getSlayers(member) },
};

export type SectionKey = keyof typeof SECTIONS;

export type SkyBlockSection = Exclude<keyof MemberView, "apiSettings">;

export const SKYBLOCK_SECTIONS: SkyBlockSection[] = [
  ...(Object.keys(SECTIONS) as SectionKey[]),
  NETWORTH_SECTION,
];

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
