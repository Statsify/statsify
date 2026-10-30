/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

// Typed views of the data scripts/sync-data.ts writes to src/generated/: NEU-REPO's (MIT, see src/generated/NOTICE.md),
// plus the skill tables and max levels from Hypixel's skills resource.
import accessories from "./generated/accessories.json" with { type: "json" };
import hotmLayout from "./generated/hotmlayout.json" with { type: "json" };
import leveling from "./generated/leveling.json" with { type: "json" };
import petTextures from "./generated/pet-textures.json" with { type: "json" };
import pets from "./generated/pets.json" with { type: "json" };
import type { Rarity } from "#types";

export const LEVELING = leveling as {
  catacombs: number[];
  HOTM: number[];
  leveling_caps: Record<string, number>;
  leveling_xp: number[];
  max_levels: Record<string, number>;
  runecrafting_xp: number[];
  sblevel_colours: Record<string, string>; // the lowest level of each bracket → a Minecraft color id
  slayer_to_highest_tier: Record<string, number>;
  slayer_xp: Record<string, number[]>;
  social: number[];
};

export const PETS = pets as {
  custom_pet_leveling: Record<
    string,
    { type?: number; pet_levels?: number[]; max_level?: number; rarity_offset?: Record<string, number> }
  >;
  id_to_display_name: Record<string, string>;
  pet_levels: number[];
  pet_rarity_offset: Record<string, number>;
};

export const PET_TEXTURES = petTextures as {
  pets: Record<string, Partial<Record<Rarity, string>>>;
  skins: Record<string, string>;
};

/** An accessory → the ids that make it inactive: its higher tiers, or the other party hats, which replace each other. */
export const ACCESSORY_UPGRADES = accessories.upgrades as Record<string, string[]>;

export const IGNORED_ACCESSORIES: ReadonlySet<string> = new Set(accessories.ignored);

export const HOTM_LAYOUT = hotmLayout as Record<
  string,
  { name: string; x: number; y: number; maxLevel: number }
>;
