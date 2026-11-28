/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

// scripts/sync-data.ts generates these from the sources in NOTICE.md.
import accessories from "./generated/accessories.json" with { type: "json" };
import essenceShops from "./generated/essenceshops.json" with { type: "json" };
import hotmLayout from "./generated/hotmlayout.json" with { type: "json" };
import leveling from "./generated/leveling.json" with { type: "json" };
import petTextures from "./generated/pet-textures.json" with { type: "json" };
import pets from "./generated/pets.json" with { type: "json" };
import powers from "./generated/powers.json" with { type: "json" };
import sblevels from "./generated/sblevels.json" with { type: "json" };
import textures from "./generated/textures-1.8.json" with { type: "json" };
import { prettify } from "@statsify/util";
import type { PowerStat, Rarity } from "#types";

export const LEVELING = leveling as {
  catacombs: number[];
  HOTM: number[];
  leveling_caps: Record<string, number>;
  leveling_xp: number[];
  max_levels: Record<string, number>;
  runecrafting_xp: number[];
  sblevel_colours: Record<string, string>; // a bracket's first level → color id
  slayer_to_highest_tier: Record<string, number>;
  slayer_xp: Record<string, number[]>;
  social: number[];
};

export const PETS = pets as {
  custom_pet_leveling: Record<
    string,
    {
      type?: number;
      pet_levels?: number[];
      max_level?: number;
      rarity_offset?: Record<string, number>;
    }
  >;
  id_to_display_name: Record<string, string>;
  pet_levels: number[];
  pet_rarity_offset: Record<string, number>;
};

export const getPetName = (type: string) =>
  PETS.id_to_display_name[type] ?? prettify(type);

// The SkyBlock XP for each point of accessory power and of pet score.
export const SKYBLOCK_XP = sblevels.core_task;

export const PET_TEXTURES = petTextures as {
  pets: Record<string, Partial<Record<Rarity, string>>>;
  skins: Record<string, string>;
};

export const MATERIAL_IDS: Record<string, number | undefined> =
  textures.materials;

// 1.8 pack texture paths by "<id>:<damage>", and by "<id>" for damage 0.
export const TEXTURE_PATHS: Record<string, string | undefined> =
  textures.textures;

// An accessory's higher tiers, or a variant like Dante's Talisman and Ring.
export const ACCESSORY_UPGRADES = accessories.upgrades as Record<
  string,
  string[]
>;

export const IGNORED_ACCESSORIES = new Set<string>(accessories.ignored);

export const HOTM_LAYOUT = hotmLayout as Record<
  string,
  { name: string; x: number; y: number; maxLevel: number }
>;

// Each essence shop's perk ids, with each perk's max level.
export const ESSENCE_SHOPS = essenceShops as Record<
  string,
  Record<string, number>
>;

// Stats scale from the listed accessoryPower, but the bonus never scales.
export const POWERS = powers as Record<
  string,
  { accessoryPower: number; stats: PowerStat[]; bonus: PowerStat[] }
>;
