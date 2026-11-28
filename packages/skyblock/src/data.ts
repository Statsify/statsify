/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

// scripts/sync-data.ts generates these from the sources in NOTICE.md.
import accessories from "./generated/accessories.json" with { type: "json" };
import attributeShards from "./generated/attribute-shards.json" with { type: "json" };
import bestiary from "./generated/bestiary.json" with { type: "json" };
import collections from "./generated/collections.json" with { type: "json" };
import essenceShops from "./generated/essenceshops.json" with { type: "json" };
import essenceTextures from "./generated/essence-textures.json" with { type: "json" };
import garden from "./generated/garden.json" with { type: "json" };
import hoppity from "./generated/hoppity.json" with { type: "json" };
import hotfLayout from "./generated/hotflayout.json" with { type: "json" };
import hotmLayout from "./generated/hotmlayout.json" with { type: "json" };
import kuudraKeys from "./generated/kuudra-keys.json" with { type: "json" };
import leveling from "./generated/leveling.json" with { type: "json" };
import petItems from "./generated/pet-items.json" with { type: "json" };
import petNums from "./generated/petnums.json" with { type: "json" };
import petTextures from "./generated/pet-textures.json" with { type: "json" };
import pets from "./generated/pets.json" with { type: "json" };
import powers from "./generated/powers.json" with { type: "json" };
import sblevels from "./generated/sblevels.json" with { type: "json" };
import stats from "./generated/stats.json" with { type: "json" };
import textures from "./generated/textures-1.8.json" with { type: "json" };
import trophyFish from "./generated/trophyfish.json" with { type: "json" };
import { prettify } from "@statsify/util";
import type { PlayerStat, PowerStat, Rarity, Stats, TreeLayout } from "#types";
import type { Skill } from "./sections/skills.js";
import type { SlayerBoss } from "./sections/slayers.js";

export const LEVELING = leveling as {
  catacombs: number[];
  // fairy_souls is the most a profile can collect.
  fairy_souls: number;
  HOTF: number[];
  HOTM: number[];
  leveling_caps: Record<string, number>;
  leveling_xp: number[];
  max_levels: Record<string, number>;
  runecrafting_xp: number[];
  // Each key is a level bracket's first level, and each value a color id.
  sblevel_colours: Record<string, string>;
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
  skinColors: Record<string, string>;
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

export const HOTM_LAYOUT = hotmLayout as TreeLayout;

export const HOTF_LAYOUT = hotfLayout as TreeLayout;

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

// Hoppity's rabbits by lowercase rarity.
export const RABBITS = hoppity as Record<string, string[]>;

export const KUUDRA_KEYS = kuudraKeys as Record<string, string>;

export const ESSENCE_TEXTURES = essenceTextures as Record<string, string>;

// Trophy fish names by the API's id, uppercased.
export const TROPHY_FISH = trophyFish as Record<string, string>;

interface BestiaryFamily {
  name: string;
  // Each level the mob spawns at has its own id.
  ids: string[];
  // Kills past the cap don't count.
  cap: number;
  bracket: string;
}

// A page with a category, like Fishing, is a subpage of it.
export const BESTIARY = bestiary as {
  // Each bracket lists the kills every tier needs.
  brackets: Record<string, number[]>;
  pages: { category?: string; name: string; families: BestiaryFamily[] }[];
};

// NEU files these sea creatures under their island's page.
const ISLAND_SEA_CREATURES: Record<string, string[]> = {
  "Lotus Atoll": [
    "Atoll Croaker",
    "Drowned Captain",
    "Frog Prince",
    "Lotus Guardian",
    "Puddle Jumper",
    "gorF",
  ],
  "Moonglade Marsh": [
    "Bogged",
    "Ent",
    "Nessie",
    "Stridersurfer",
    "Tadgang",
    "The Loch Emperor",
    "Wetwing",
  ],
  "Torrhus Canyon": [
    "Brineling",
    "Giant Isopod",
    "Haggard",
    "Silkbreeze",
    "Sprawl",
    "Torrid",
  ],
};

export const SEA_CREATURES = BESTIARY.pages.flatMap(
  ({ name, category, families }) =>
    category === "Fishing"
      ? families
      : families.filter((family) =>
          ISLAND_SEA_CREATURES[name]?.includes(family.name),
        ),
);

// Each item's tiers are the amounts they need, in the resource's order.
export const COLLECTIONS = collections as {
  id: string;
  name: string;
  items: { id: string; name: string; tiers: number[] }[];
}[];

// An attribute's levels cost its rarity's `levels`, in shards per level.
export const ATTRIBUTE_SHARDS = attributeShards as {
  levels: Record<Rarity, number[]>;
  shards: {
    id: string;
    name: string;
    attribute: string;
    attributeName: string;
    rarity: Rarity;
    // The grants are level I's stats.
    grants?: { stat: PlayerStat; value: number }[];
    families?: string[];
    unconsumable?: boolean;
  }[];
};

// Crop milestones are keyed by the API's crop id, upgrades by level count.
export const GARDEN = garden as {
  garden_exp: number[];
  crop_milestones: Record<string, number[]>;
  visitors: Record<string, Rarity>;
  plots: string[];
  crop_upgrades: number;
  composter_upgrades: Record<string, number>;
};

// Pet score's Magic Find is keyed by the lowest score that gives it.
export const STAT_TABLES = stats as {
  base: Stats;
  skills: Record<Skill, Stats[]>;
  slayers: Record<Exclude<SlayerBoss, "blaze" | "vampire">, Stats[]>;
  pet_score: Record<string, number>;
};

// Pet stats are listed at levels 1 and 100, or at `levels` for the dragons.
export const PET_STATS = petNums as Record<
  string,
  Partial<Record<Rarity, { first: Stats; last: Stats; levels?: number[] }>>
>;

// petStats and allPetStats are percents that raise the pet's own stats.
export const PET_ITEMS = petItems as Record<
  string,
  { stats?: Stats; petStats?: Stats; allPetStats?: number }
>;
