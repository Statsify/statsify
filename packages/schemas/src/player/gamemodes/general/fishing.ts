/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Field } from "#metadata";
import { add } from "@statsify/math";
import type { APIData } from "@statsify/util";

export const FISHING_ENVIRONMENTS = ["water", "lava", "ice"] as const;
export type FishingEnvironment = (typeof FISHING_ENVIRONMENTS)[number];

export const FISHING_EVENTS = ["halloween", "christmas", "easter", "summer"] as const;
export type FishingEvent = (typeof FISHING_EVENTS)[number];

export const FISHING_CATCH_TYPES = ["fish", "junk", "treasure", "plant", "creature"] as const;
export type FishingCatchType = (typeof FISHING_CATCH_TYPES)[number];

export const FISHING_ITEMS = {
  fish: ["salmon", "clownfish", "cooked_salmon", "charred_pufferfish", "cooked_cod", "pufferfish", "cod", "trout", "pike", "perch"],
  junk: [
    "charcoal", "soggy_paper", "ink_sac", "broken_fishing_rod", "water_bottle", "bowl", "rotten_flesh", "string", "rabbit_hide",
    "leather", "lily_pad", "bone", "leather_boots", "tripwire_hook", "stick", "coal", "fermented_spider_eye", "burned_flesh",
    "steak", "nether_brick", "lava_bucket", "clump_of_leaves", "frozen_flesh", "snowball", "ice_shard",
  ],
  treasure: [
    "eye_of_ender", "molten_gold", "blaze_powder", "gold_sword", "name_tag", "enchanted_book", "diamond", "compass", "gold_pickaxe",
    "emerald", "enchanted_fishing_rod", "enchanted_bow", "saddle", "diamond_sword", "magma_cream", "blaze_rod",
    "chainmail_chestplate", "iron_sword", "nautilus_shell",
  ],
  plant: [
    "kelp", "bamboo", "dried_kelp", "glow_berries", "melon", "potato", "sweet_berries", "wheat", "frozen_kelp", "baked_potato",
    "charred_berries", "nether_wart", "glistering_melon", "warped_roots",
  ],
  creature: [
    "chicken", "cow", "creeper", "pig", "sheep", "skeleton", "slime", "spider", "squid", "zombie", "blaze", "cave_spider",
    "magma_cube", "pig_zombie",
  ],
} as const satisfies Record<FishingCatchType, readonly string[]>;

export const FISHING_MYTHICAL_FISH = [
  { id: "helios", name: "Ember of Helios", rarity: "common", maxWeight: 15 },
  { id: "selene", name: "Dust of Selene", rarity: "common", maxWeight: 15 },
  { id: "nyx", name: "Shadow of Nyx", rarity: "uncommon", maxWeight: 25 },
  { id: "aphrodite", name: "Heart of Aphrodite", rarity: "uncommon", maxWeight: 25 },
  { id: "zeus", name: "Spark of Zeus", rarity: "rare", maxWeight: 40 },
  { id: "demeter", name: "Spirit of Demeter", rarity: "rare", maxWeight: 40 },
  { id: "archimedes", name: "Automaton of Daedalus", rarity: "ultra_rare" },
  { id: "hades", name: "Wrath of Hades", rarity: "ultra_rare" },
] as const;

export type FishingMythicalId = (typeof FISHING_MYTHICAL_FISH)[number]["id"];

export const FISHING_SPECIAL_FISH = [
  { id: "puffer_emoji", source: "anytime", environment: "water" },
  { id: "nemo", source: "anytime", environment: "water" },
  { id: "knockback_slimeball", source: "anytime", environment: "water" },
  { id: "hot_potato", source: "anytime", environment: "water" },
  { id: "fish_monger_suit_helmet", source: "anytime", environment: "water" },
  { id: "fish_monger_suit_chestplate", source: "anytime", environment: "water" },
  { id: "fish_monger_suit_leggings", source: "anytime", environment: "water" },
  { id: "fish_monger_suit_boots", source: "anytime", environment: "water" },
  { id: "barnacle", source: "anytime", environment: "water" },
  { id: "leviathan", source: "anytime", environment: "water" },
  { id: "star_eater_scales", source: "anytime", environment: "water" },
  { id: "rubber_duck", source: "anytime", environment: "water" },
  { id: "oops_the_fish", source: "summer", environment: "water" },
  { id: "shark", source: "summer", environment: "water" },
  { id: "sea_bass", source: "summer", environment: "water" },
  { id: "sunscreen", source: "summer", environment: "water" },
  { id: "pile_of_sand", source: "summer", environment: "water" },
  // Hypixel also still sends the old "mahi-mahi" id next to this one
  { id: "mahi_mahi", source: "summer", environment: "water" },
  { id: "lucent_bee_hive", source: "summer", environment: "water" },
  { id: "spook_the_fish", source: "halloween", environment: "water" },
  { id: "chocolate_bar", source: "halloween", environment: "water" },
  { id: "pumpkin_spice_latte", source: "halloween", environment: "water" },
  { id: "angler", source: "halloween", environment: "water" },
  { id: "pumpkin_pie", source: "halloween", environment: "water" },
  { id: "eyeball", source: "halloween", environment: "water" },
  { id: "wayfinders_compass", source: "halloween", environment: "water" },
  { id: "molten_iron", source: "halloween", environment: "lava" },
  { id: "regular_fish", source: "halloween", environment: "lava" },
  { id: "lava_shark", source: "halloween", environment: "lava" },
  { id: "chill_the_fish_3", source: "christmas", environment: "water" },
  { id: "frozen_fish", source: "christmas", environment: "ice" },
  { id: "festival_pufferfish_hat", source: "christmas", environment: "water" },
  { id: "eggnog", source: "christmas", environment: "water" },
  { id: "dawning_snowball", source: "christmas", environment: "ice" },
  { id: "frozen_meal", source: "christmas", environment: "ice" },
  { id: "festive_lights", source: "christmas", environment: "ice" },
  { id: "egg_the_fish", source: "easter", environment: "water" },
  { id: "cracked_egg", source: "easter", environment: "water" },
  { id: "raw_ham", source: "easter", environment: "water" },
  { id: "carrot", source: "easter", environment: "water" },
  { id: "soggy_hot_cross_bun", source: "easter", environment: "water" },
  { id: "clay_ball", source: "easter", environment: "water" },
  { id: "rose", source: "easter", environment: "water" },
  { id: "cherry_blossom", source: "easter", environment: "water" },
  { id: "poisonous_potato", source: "fishingFriday", environment: "water" },
  { id: "golden_apple", source: "fishingFriday", environment: "water" },
  { id: "burnt_plant", source: "denseVegetation", environment: "lava" },
] as const;

export type FishingSpecialFishId = (typeof FISHING_SPECIAL_FISH)[number]["id"];

export const FISHING_RODS = [
  "fishing_rod_3000",
  "fishing_rod_inaugural_ice",
  "fishing_rod_springtime",
  "fishing_rod_haunted",
  "fishing_rod_festive",
  "fishing_rod_solar",
  "fishing_rod_overgrown",
  "fishing_rod_zoologist",
] as const;

export type FishingRod = (typeof FISHING_RODS)[number];

export const FISHING_HOOK_TRAILS = [
  "mainlobby_fishing_emerald",
  "mainlobby_fishing_sparkle",
  "mainlobby_fishing_treasure_sheen",
  "mainlobby_fishing_beloved_junk",
  "mainlobby_fishing_archimedes",
  "mainlobby_fishing_hades_hook",
  "mainlobby_fishing_helios_breath",
  "mainlobby_fishing_organic_material",
  "mainlobby_fishing_creature_catch",
  "mainlobby_fishing_neptune_grace",
  "mainlobby_fishing_ominous_rain",
  "mainlobby_fishing_gold_particles",
] as const;

export type FishingHookTrail = (typeof FISHING_HOOK_TRAILS)[number];

// A field per id instead of an array, so Mongo stores only what a player has and a
// reordered registry can't shift stored values onto other items
const createRegistryStats = <Id extends string, Type extends NumberConstructor | BooleanConstructor>(
  ids: readonly Id[],
  type: Type
) => {
  class RegistryStats {
    [id: string]: ReturnType<Type>;

    public constructor(value: (id: Id) => ReturnType<Type>) {
      Object.assign(this, Object.fromEntries(ids.map((id) => [id, value(id)])));
    }
  }

  for (const id of ids) Field({ type: () => type, leaderboard: { enabled: false } })(RegistryStats.prototype, id);

  return RegistryStats as unknown as new (value: (id: Id) => ReturnType<Type>) => Record<Id, ReturnType<Type>>;
};

type FishingItem<T extends FishingCatchType> = (typeof FISHING_ITEMS)[T][number];

const FishingMythicalStats = createRegistryStats(FISHING_MYTHICAL_FISH.map((mythical) => mythical.id), Number);
const FishingSpecialFishUnlocks = createRegistryStats(FISHING_SPECIAL_FISH.map((fish) => fish.id), Boolean);
const FishingRodUnlocks = createRegistryStats(FISHING_RODS, Boolean);
const FishingHookTrailUnlocks = createRegistryStats(FISHING_HOOK_TRAILS, Boolean);

const FishingFishCatches = createRegistryStats(FISHING_ITEMS.fish, Number);
const FishingJunkCatches = createRegistryStats(FISHING_ITEMS.junk, Number);
const FishingTreasureCatches = createRegistryStats(FISHING_ITEMS.treasure, Number);
const FishingPlantCatches = createRegistryStats(FISHING_ITEMS.plant, Number);
const FishingCreatureCatches = createRegistryStats(FISHING_ITEMS.creature, Number);

export class FishingItemCatches {
  @Field({ type: () => FishingFishCatches })
  public fish: Record<FishingItem<"fish">, number>;

  @Field({ type: () => FishingJunkCatches })
  public junk: Record<FishingItem<"junk">, number>;

  @Field({ type: () => FishingTreasureCatches })
  public treasure: Record<FishingItem<"treasure">, number>;

  @Field({ type: () => FishingPlantCatches })
  public plant: Record<FishingItem<"plant">, number>;

  @Field({ type: () => FishingCreatureCatches })
  public creature: Record<FishingItem<"creature">, number>;

  public constructor(data: APIData = {}) {
    this.fish = new FishingFishCatches((id) => data.fish?.[id]);
    this.junk = new FishingJunkCatches((id) => data.junk?.[id]);
    this.treasure = new FishingTreasureCatches((id) => data.treasure?.[id]);
    this.plant = new FishingPlantCatches((id) => data.plant?.[id]);
    this.creature = new FishingCreatureCatches((id) => data.creature?.[id]);
  }
}

export class FishingEnvironmentStats {
  @Field({ leaderboard: { enabled: false } })
  public fish: number;

  @Field({ leaderboard: { enabled: false } })
  public junk: number;

  @Field({ leaderboard: { enabled: false } })
  public treasure: number;

  @Field({ leaderboard: { enabled: false } })
  public plant: number;

  @Field({ leaderboard: { enabled: false } })
  public creature: number;

  @Field({ leaderboard: { enabled: false } })
  public mythical: number;

  @Field({ leaderboard: { enabled: false } })
  public total: number;

  public constructor(data: APIData = {}) {
    this.fish = data.fish;
    this.junk = data.junk;
    this.treasure = data.treasure;
    this.plant = data.plant;
    this.creature = data.creature;
    this.mythical = data.orb;
    this.total = add(this.fish, this.junk, this.treasure, this.plant, this.creature, this.mythical);
  }
}

export class FishingSeasonalEvent {
  @Field()
  public water: FishingEnvironmentStats;

  @Field()
  public lava: FishingEnvironmentStats;

  @Field()
  public ice: FishingEnvironmentStats;

  @Field({ leaderboard: { enabled: false } })
  public total: number;

  public constructor(data: APIData = {}) {
    this.water = new FishingEnvironmentStats(data.water);
    this.lava = new FishingEnvironmentStats(data.lava);
    this.ice = new FishingEnvironmentStats(data.ice);
    this.total = add(this.water.total, this.lava.total, this.ice.total);
  }
}

export class FishingSeasonalYear {
  @Field()
  public year: string;

  @Field()
  public halloween: FishingSeasonalEvent;

  @Field()
  public christmas: FishingSeasonalEvent;

  @Field()
  public easter: FishingSeasonalEvent;

  @Field()
  public summer: FishingSeasonalEvent;

  @Field({ leaderboard: { enabled: false } })
  public total: number;

  public constructor(year: string, data: APIData = {}) {
    this.year = year;
    this.halloween = new FishingSeasonalEvent(data.halloween);
    this.christmas = new FishingSeasonalEvent(data.christmas);
    this.easter = new FishingSeasonalEvent(data.easter);
    this.summer = new FishingSeasonalEvent(data.summer);
    this.total = add(this.halloween.total, this.christmas.total, this.easter.total, this.summer.total);
  }
}

export class FishingEnchantments {
  @Field({ leaderboard: { enabled: false } })
  public luck: number;

  @Field({ leaderboard: { enabled: false } })
  public lure: number;

  @Field({ leaderboard: { enabled: false } })
  public mythicalHook: number;

  @Field({ leaderboard: { enabled: false } })
  public collector: number;

  @Field({ leaderboard: { enabled: false } })
  public dumpsterDiver: number;

  @Field({ leaderboard: { enabled: false } })
  public vulcansBlessing: number;

  @Field({ leaderboard: { enabled: false } })
  public neptunesFury: number;

  @Field({ leaderboard: { enabled: false } })
  public herbivore: number;

  public constructor(data: APIData = {}) {
    this.luck = data.luck?.level;
    this.lure = data.lure?.level;
    this.mythicalHook = data.mythical_hook?.level;
    this.collector = data.collector?.level;
    this.dumpsterDiver = data.dumpster_diver?.level;
    this.vulcansBlessing = data.vulcans_blessing?.level;
    this.neptunesFury = data.neptunes_fury?.level;
    this.herbivore = data.herbivore?.level;
  }
}

export class FishingFireproofing {
  @Field({ leaderboard: { enabled: false } })
  public scales: number;

  @Field({ leaderboard: { enabled: false } })
  public sealant: number;

  @Field({ leaderboard: { enabled: false } })
  public flame: number;

  public constructor(data: APIData = {}) {
    this.scales = data.scales;
    this.sealant = data.sealant;
    this.flame = data.flame;
  }
}

export class Fishing {
  @Field()
  public totalCatches: number;

  @Field()
  public fish: number;

  @Field()
  public junk: number;

  @Field()
  public treasure: number;

  @Field()
  public plant: number;

  @Field()
  public creature: number;

  @Field({ leaderboard: { fieldName: "Mythical Fish" } })
  public mythical: number;

  @Field({ leaderboard: { fieldName: "Special Fish" } })
  public special: number;

  @Field()
  public water: FishingEnvironmentStats;

  @Field()
  public lava: FishingEnvironmentStats;

  @Field()
  public ice: FishingEnvironmentStats;

  @Field({ type: () => FishingMythicalStats })
  public mythicals: Record<FishingMythicalId, number>;

  @Field({ type: () => FishingMythicalStats })
  public mythicalWeights: Record<FishingMythicalId, number>;

  @Field({ type: () => FishingSpecialFishUnlocks })
  public specialFish: Record<FishingSpecialFishId, boolean>;

  @Field({ type: () => FishingRodUnlocks })
  public rods: Record<FishingRod, boolean>;

  @Field({ type: () => FishingHookTrailUnlocks })
  public hookTrails: Record<FishingHookTrail, boolean>;

  @Field()
  public activeRod: string;

  @Field()
  public activeHookTrail: string;

  // Players saved before this field existed come back from Mongo without it
  @Field({ type: () => [FishingSeasonalYear], store: { default: [] } })
  public seasonal: FishingSeasonalYear[];

  @Field()
  public enchants: FishingEnchantments;

  @Field()
  public fireproofing: FishingFireproofing;

  @Field()
  public catches: FishingItemCatches;

  public constructor(mainLobby: APIData = {}) {
    const fishing = mainLobby.fishing ?? {};
    const { permanent = {}, ...years }: APIData = fishing.stats ?? {};
    const packages: string[] = mainLobby.packages ?? [];

    this.water = new FishingEnvironmentStats(permanent.water);
    this.lava = new FishingEnvironmentStats(permanent.lava);
    this.ice = new FishingEnvironmentStats(permanent.ice);

    this.fish = add(this.water.fish, this.lava.fish, this.ice.fish);
    this.junk = add(this.water.junk, this.lava.junk, this.ice.junk);
    this.treasure = add(this.water.treasure, this.lava.treasure, this.ice.treasure);
    this.plant = add(this.water.plant, this.lava.plant, this.ice.plant);
    this.creature = add(this.water.creature, this.lava.creature, this.ice.creature);

    this.mythicals = new FishingMythicalStats((id) => fishing.orbs?.[id]);
    this.mythicalWeights = new FishingMythicalStats((id) => fishing.orbs?.weight?.[id]);
    this.mythical = add(...Object.values(this.mythicals));

    this.totalCatches = add(this.fish, this.junk, this.treasure, this.plant, this.creature, this.mythical);

    this.specialFish = new FishingSpecialFishUnlocks((id) => fishing.special_fish?.[id] === true);
    this.special = Object.values(this.specialFish).filter(Boolean).length;

    this.catches = new FishingItemCatches(permanent.individual);

    this.seasonal = Object.entries(years)
      .map(([year, data]) => new FishingSeasonalYear(year, data))
      .filter((year) => year.total > 0)
      .sort((a, b) => Number(a.year) - Number(b.year));

    this.activeRod = fishing.activeFishingRod;
    this.activeHookTrail = fishing.activeFishHookTrail === "none" ? undefined : fishing.activeFishHookTrail;

    // Hypixel only lists event rewards in packages, so the rest are inferred from their requirements
    const unlockedRods: Partial<Record<FishingRod, boolean>> = {
      fishing_rod_inaugural_ice: this.seasonal.some((year) => year.year === "2022" && year.christmas.ice.total > 0),
      fishing_rod_overgrown:
        this.specialFish.poisonous_potato && this.specialFish.golden_apple && this.specialFish.burnt_plant,
      fishing_rod_zoologist: this.catches.creature.squid > 0,
    };

    this.rods = new FishingRodUnlocks(
      (id) => packages.includes(id) || id === this.activeRod || (unlockedRods[id] ?? false)
    );

    const unlockedHookTrails: Partial<Record<FishingHookTrail, boolean>> = {
      mainlobby_fishing_emerald: this.mythical >= 500,
      mainlobby_fishing_sparkle: this.special >= 20,
      mainlobby_fishing_treasure_sheen: this.treasure >= 5000,
      mainlobby_fishing_beloved_junk: this.junk >= 5000,
      mainlobby_fishing_archimedes: this.mythicals.archimedes >= 1,
      mainlobby_fishing_hades_hook: this.mythicals.hades >= 5,
      mainlobby_fishing_organic_material: this.plant >= 1000,
      mainlobby_fishing_creature_catch: this.creature >= 1000,
    };

    this.hookTrails = new FishingHookTrailUnlocks(
      (id) => packages.includes(id) || id === this.activeHookTrail || (unlockedHookTrails[id] ?? false)
    );

    this.enchants = new FishingEnchantments(fishing.enchants);
    this.fireproofing = new FishingFireproofing(fishing.fireproofing);
  }
}
