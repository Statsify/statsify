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
import essenceShops from "./generated/essenceshops.json" with { type: "json" };
import hoppity from "./generated/hoppity.json" with { type: "json" };
import hotfLayout from "./generated/hotflayout.json" with { type: "json" };
import hotmLayout from "./generated/hotmlayout.json" with { type: "json" };
import kuudraKeys from "./generated/kuudra-keys.json" with { type: "json" };
import leveling from "./generated/leveling.json" with { type: "json" };
import petTextures from "./generated/pet-textures.json" with { type: "json" };
import pets from "./generated/pets.json" with { type: "json" };
import powers from "./generated/powers.json" with { type: "json" };
import sblevels from "./generated/sblevels.json" with { type: "json" };
import seaCreatures from "./generated/sea-creatures.json" with { type: "json" };
import trophyFish from "./generated/trophyfish.json" with { type: "json" };
import type { PowerStat, Rarity, TreeLayout } from "#types";

export const LEVELING = leveling as {
  catacombs: number[];
  HOTF: number[];
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

/** SkyBlock XP per point of accessory power and of pet score. */
export const SKYBLOCK_XP = sblevels.core_task;

export const PET_TEXTURES = petTextures as {
  pets: Record<string, Partial<Record<Rarity, string>>>;
  skins: Record<string, string>;
};

/** An accessory → the ids that make it inactive: its higher tiers, or the other party hats, which replace each other. */
export const ACCESSORY_UPGRADES = accessories.upgrades as Record<string, string[]>;

export const IGNORED_ACCESSORIES: ReadonlySet<string> = new Set(accessories.ignored);

export const HOTM_LAYOUT = hotmLayout as TreeLayout;

/** Essence type (WITHER, CRIMSON…) → its shop's perks → each perk's max level. */
export const ESSENCE_SHOPS = essenceShops as Record<string, Record<string, number>>;

/**
 * A stone Power's stats at the Accessory Power its stone lists them for, and its Unique Power Bonus, which doesn't
 * scale. Powers learned without a stone aren't here.
 */
export const POWERS = powers as Record<string, { accessoryPower: number; stats: PowerStat[]; bonus: PowerStat[] }>;

export const HOTF_LAYOUT = hotfLayout as TreeLayout;

/** Hoppity's rabbits by rarity, common to divine. */
export const RABBITS = hoppity as Record<string, string[]>;

/** Each Kuudra tier's key head, by the API's tier names (none is the basic tier). */
export const KUUDRA_KEYS = kuudraKeys as Record<string, string>;

/** Trophy fish id, as the API spells it but uppercased → name. */
export const TROPHY_FISH = trophyFish as Record<string, string>;

/** Every sea creature, with its bestiary kill ids (one per level it spawns at). */
export const SEA_CREATURES = seaCreatures as { name: string; ids: string[] }[];
