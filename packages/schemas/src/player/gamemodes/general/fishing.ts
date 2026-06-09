/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Field } from "#metadata";
import type { APIData } from "@statsify/util";

type FishingEnvironment = "water" | "lava" | "ice";
export type FishingEvent = "halloween" | "christmas" | "easter" | "summer";

export const FISHING_EVENTS: FishingEvent[] = [
  "halloween",
  "christmas",
  "easter",
  "summer",
];
const FISHING_FIRST_YEAR = 2022;
const isYearKey = (key: string) => /^\d{4}$/.test(key);

const toNumber = (value: unknown) => (typeof value === "number" ? value : 0);
const hasPackage = (packages: string[], id: string) => packages.includes(id);

const sum = (...values: number[]) =>
  values.reduce((total, value) => total + value, 0);

const keyToName = (key: string) =>
  key
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export interface FishingSpecialFishData {
  id: string;
  name: string;
  source: string;
  environment: FishingEnvironment;
}

export const FISHING_SPECIAL_FISH: FishingSpecialFishData[] = [
  {
    id: "puffer_emoji",
    name: "Puffer Emoji",
    source: "Anytime",
    environment: "water",
  },
  { id: "nemo", name: "Nemo", source: "Anytime", environment: "water" },
  {
    id: "knockback_slimeball",
    name: "Knockback Slimeball",
    source: "Anytime",
    environment: "water",
  },
  {
    id: "hot_potato",
    name: "Hot Potato",
    source: "Anytime",
    environment: "water",
  },
  {
    id: "fish_monger_suit_helmet",
    name: "Fish Monger Helmet",
    source: "Anytime",
    environment: "water",
  },
  {
    id: "fish_monger_suit_chestplate",
    name: "Fish Monger Chestplate",
    source: "Anytime",
    environment: "water",
  },
  {
    id: "fish_monger_suit_leggings",
    name: "Fish Monger Leggings",
    source: "Anytime",
    environment: "water",
  },
  {
    id: "fish_monger_suit_boots",
    name: "Fish Monger Boots",
    source: "Anytime",
    environment: "water",
  },
  { id: "barnacle", name: "Barnacle", source: "Anytime", environment: "water" },
  {
    id: "leviathan",
    name: "Leviathan",
    source: "Anytime",
    environment: "water",
  },
  {
    id: "star_eater_scales",
    name: "Star Eater Scales",
    source: "Anytime",
    environment: "water",
  },
  {
    id: "rubber_duck",
    name: "Rubber Duck",
    source: "Anytime",
    environment: "water",
  },
  {
    id: "oops_the_fish",
    name: "Oops The Fish",
    source: "Summer",
    environment: "water",
  },
  { id: "shark", name: "Shark", source: "Summer", environment: "water" },
  { id: "sea_bass", name: "Sea Bass", source: "Summer", environment: "water" },
  {
    id: "sunscreen",
    name: "Sunscreen",
    source: "Summer",
    environment: "water",
  },
  {
    id: "pile_of_sand",
    name: "Pile Of Sand",
    source: "Summer",
    environment: "water",
  },
  {
    id: "mahi-mahi",
    name: "Mahi Mahi",
    source: "Summer",
    environment: "water",
  },
  {
    id: "mahi_mahi",
    name: "Mahi Mahi",
    source: "Summer",
    environment: "water",
  },
  {
    id: "lucent_bee_hive",
    name: "Lucent Bee Hive",
    source: "Summer",
    environment: "water",
  },
  {
    id: "spook_the_fish",
    name: "Spook The Fish",
    source: "Halloween",
    environment: "water",
  },
  {
    id: "chocolate_bar",
    name: "Chocolate Bar",
    source: "Halloween",
    environment: "water",
  },
  {
    id: "pumpkin_spice_latte",
    name: "Pumpkin Spice Latte",
    source: "Halloween",
    environment: "water",
  },
  { id: "angler", name: "Angler", source: "Halloween", environment: "water" },
  {
    id: "pumpkin_pie",
    name: "Pumpkin Pie",
    source: "Halloween",
    environment: "water",
  },
  { id: "eyeball", name: "Eyeball", source: "Halloween", environment: "water" },
  {
    id: "wayfinders_compass",
    name: "Wayfinders Compass",
    source: "Halloween",
    environment: "water",
  },
  {
    id: "molten_iron",
    name: "Molten Iron",
    source: "Halloween",
    environment: "lava",
  },
  {
    id: "regular_fish",
    name: "Regular Fish",
    source: "Halloween",
    environment: "lava",
  },
  {
    id: "lava_shark",
    name: "Lava Shark",
    source: "Halloween",
    environment: "lava",
  },
  {
    id: "chill_the_fish_3",
    name: "Chill The Fish 3",
    source: "Holiday",
    environment: "water",
  },
  {
    id: "frozen_fish",
    name: "Frozen Fish",
    source: "Holiday",
    environment: "ice",
  },
  {
    id: "festival_pufferfish_hat",
    name: "Festival Pufferfish Hat",
    source: "Holiday",
    environment: "water",
  },
  { id: "eggnog", name: "Eggnog", source: "Holiday", environment: "water" },
  {
    id: "dawning_snowball",
    name: "Dawning Snowball",
    source: "Holiday",
    environment: "ice",
  },
  {
    id: "frozen_meal",
    name: "Frozen Meal",
    source: "Holiday",
    environment: "ice",
  },
  {
    id: "festive_lights",
    name: "Festive Lights",
    source: "Holiday",
    environment: "ice",
  },
  {
    id: "egg_the_fish",
    name: "Egg The Fish",
    source: "Easter",
    environment: "water",
  },
  {
    id: "cracked_egg",
    name: "Cracked Egg",
    source: "Easter",
    environment: "water",
  },
  { id: "raw_ham", name: "Raw Ham", source: "Easter", environment: "water" },
  { id: "carrot", name: "Carrot", source: "Easter", environment: "water" },
  {
    id: "soggy_hot_cross_bun",
    name: "Soggy Hot Cross Bun",
    source: "Easter",
    environment: "water",
  },
  {
    id: "clay_ball",
    name: "Clay Ball",
    source: "Easter",
    environment: "water",
  },
  { id: "rose", name: "Rose", source: "Easter", environment: "water" },
  {
    id: "cherry_blossom",
    name: "Cherry Blossom",
    source: "Easter",
    environment: "water",
  },
  {
    id: "poisonous_potato",
    name: "Poisonous Potato",
    source: "Fishing Friday",
    environment: "water",
  },
  {
    id: "golden_apple",
    name: "Golden Apple",
    source: "Fishing Friday",
    environment: "water",
  },
  {
    id: "burnt_plant",
    name: "Burnt Plant",
    source: "Dense Vegetation",
    environment: "lava",
  },
];

export interface FishingMythicalData {
  id: string;
  name: string;
  rarity: string;
  maxWeightCap: number;
}

export const FISHING_MYTHICAL_FISH: FishingMythicalData[] = [
  { id: "helios", name: "Ember of Helios", rarity: "Common", maxWeightCap: 15 },
  { id: "selene", name: "Dust of Selene", rarity: "Common", maxWeightCap: 15 },
  { id: "nyx", name: "Shadow of Nyx", rarity: "Uncommon", maxWeightCap: 25 },
  {
    id: "aphrodite",
    name: "Heart of Aphrodite",
    rarity: "Uncommon",
    maxWeightCap: 25,
  },
  { id: "zeus", name: "Spark of Zeus", rarity: "Rare", maxWeightCap: 40 },
  {
    id: "demeter",
    name: "Spirit of Demeter",
    rarity: "Rare",
    maxWeightCap: 40,
  },
  {
    id: "archimedes",
    name: "Automaton of Daedalus",
    rarity: "Ultra Rare",
    maxWeightCap: 0,
  },
  {
    id: "hades",
    name: "Wrath Of Hades",
    rarity: "Ultra Rare",
    maxWeightCap: 0,
  },
];

export interface FishingRodData {
  id: string;
  name: string;
  requirement: string;
}

export const FISHING_RODS: FishingRodData[] = [
  {
    id: "fishing_rod_3000",
    name: "Fishing Rod 3000",
    requirement: "Default fishing rod",
  },
  {
    id: "fishing_rod_inaugural_ice",
    name: "Inaugural Ice Fishing Rod",
    requirement: "Holidays 2022 limited item",
  },
  {
    id: "fishing_rod_springtime",
    name: "Springtime Fishing Rod",
    requirement: "Spring Fishing Reward",
  },
  {
    id: "fishing_rod_haunted",
    name: "Haunted Fishing Rod",
    requirement: "Halloween Fishing Reward",
  },
  {
    id: "fishing_rod_festive",
    name: "Festive Fishing Rod",
    requirement: "Holidays Fishing Reward",
  },
  {
    id: "fishing_rod_solar",
    name: "Solar Fishing Rod",
    requirement: "Summer Fishing Reward",
  },
  {
    id: "fishing_rod_overgrown",
    name: "Overgrown Fishing Rod",
    requirement: "Poisonous Potato, Golden Apple, Burnt Plant",
  },
  {
    id: "fishing_rod_zoologist",
    name: "Zoologist Fishing Rod",
    requirement: "Catch 1 squid during Creatures modifier",
  },
];

export interface FishingHookTrailData {
  id: string;
  name: string;
  requirement: string;
}

export const FISHING_HOOK_TRAILS: FishingHookTrailData[] = [
  {
    id: "mainlobby_fishing_emerald",
    name: "Emerald",
    requirement: "Catch 500 Mythical Fish",
  },
  {
    id: "mainlobby_fishing_sparkle",
    name: "Sparkle",
    requirement: "Catch 20 Special Fish",
  },
  {
    id: "mainlobby_fishing_treasure_sheen",
    name: "Treasure's Sheen",
    requirement: "Catch 5,000 Treasure Items",
  },
  {
    id: "mainlobby_fishing_beloved_junk",
    name: "Beloved Junk",
    requirement: "Catch 5,000 Junk Items",
  },
  {
    id: "mainlobby_fishing_archimedes_trail",
    name: "Archimedes' Trail",
    requirement: "Catch Automaton of Daedalus 1 time",
  },
  {
    id: "mainlobby_fishing_hades_hook",
    name: "Hades' Hook",
    requirement: "Catch Wrath Of Hades 5 times",
  },
  {
    id: "mainlobby_fishing_helios_breath",
    name: "Helios' Breath",
    requirement: "Event Shop",
  },
  {
    id: "mainlobby_fishing_organic_material",
    name: "Organic Material",
    requirement: "Catch 1,000 Plants",
  },
  {
    id: "mainlobby_fishing_creature_catch",
    name: "Creature Catch",
    requirement: "Catch 1,000 Creatures",
  },
  {
    id: "mainlobby_fishing_neptune_grace",
    name: "Neptune's Grace",
    requirement: "Event Shop",
  },
  {
    id: "mainlobby_fishing_ominous_rain",
    name: "Omnius Rain",
    requirement: "Event Shop",
  },
];

export type FishingCatchCategory =
  | "fish"
  | "treasure"
  | "junk"
  | "plant"
  | "creature";

export interface FishingItemData {
  id: string;
  name: string;
}

export const FISHING_INDIVIDUAL_FISH: FishingItemData[] = [
  { id: "salmon", name: "Salmon" },
  { id: "clownfish", name: "Clownfish" },
  { id: "cooked_salmon", name: "Cooked Salmon" },
  { id: "charred_pufferfish", name: "Charred Pufferfish" },
  { id: "cooked_cod", name: "Cooked Cod" },
  { id: "pufferfish", name: "Pufferfish" },
  { id: "cod", name: "Cod" },
  { id: "trout", name: "Trout" },
  { id: "pike", name: "Pike" },
  { id: "perch", name: "Perch" },
  { id: "kelp", name: "Kelp" },
];

export const FISHING_INDIVIDUAL_TREASURE: FishingItemData[] = [
  { id: "eye_of_ender", name: "Eye of Ender" },
  { id: "molten_gold", name: "Molten Gold" },
  { id: "blaze_powder", name: "Blaze Powder" },
  { id: "gold_sword", name: "Gold Sword" },
  { id: "name_tag", name: "Name Tag" },
  { id: "enchanted_book", name: "Enchanted Book" },
  { id: "diamond", name: "Diamond" },
  { id: "compass", name: "Compass" },
  { id: "gold_pickaxe", name: "Gold Pickaxe" },
  { id: "emerald", name: "Emerald" },
  { id: "enchanted_fishing_rod", name: "Enchanted Fishing Rod" },
  { id: "enchanted_bow", name: "Enchanted Bow" },
  { id: "saddle", name: "Saddle" },
  { id: "diamond_sword", name: "Diamond Sword" },
  { id: "magma_cream", name: "Magma Cream" },
  { id: "blaze_rod", name: "Blaze Rod" },
  { id: "chainmail_chestplate", name: "Chainmail Chestplate" },
  { id: "iron_sword", name: "Iron Sword" },
  { id: "nautilus_shell", name: "Nautilus Shell" },
];

export const FISHING_INDIVIDUAL_JUNK: FishingItemData[] = [
  { id: "charcoal", name: "Charcoal" },
  { id: "soggy_paper", name: "Soggy Paper" },
  { id: "ink_sac", name: "Ink Sac" },
  { id: "broken_fishing_rod", name: "Broken Fishing Rod" },
  { id: "water_bottle", name: "Water Bottle" },
  { id: "bowl", name: "Bowl" },
  { id: "rotten_flesh", name: "Rotten Flesh" },
  { id: "string", name: "String" },
  { id: "rabbit_hide", name: "Rabbit Hide" },
  { id: "leather", name: "Leather" },
  { id: "lily_pad", name: "Lily Pad" },
  { id: "bone", name: "Bone" },
  { id: "leather_boots", name: "Leather Boots" },
  { id: "tripwire_hook", name: "Tripwire Hook" },
  { id: "stick", name: "Stick" },
  { id: "coal", name: "Coal" },
  { id: "fermented_spider_eye", name: "Fermented Spider Eye" },
  { id: "burned_flesh", name: "Burned Flesh" },
  { id: "steak", name: "Steak" },
  { id: "nether_brick", name: "Nether Brick" },
  { id: "lava_bucket", name: "Lava Bucket" },
  { id: "clump_of_leaves", name: "Clump of Leaves" },
  { id: "frozen_flesh", name: "Frozen Flesh" },
  { id: "snowball", name: "Snowball" },
  { id: "ice_shard", name: "Ice Shard" },
];

export const FISHING_INDIVIDUAL_PLANT: FishingItemData[] = [
  { id: "kelp", name: "Kelp" },
  { id: "bamboo", name: "Bamboo" },
  { id: "dried_kelp", name: "Dried Kelp" },
  { id: "glow_berries", name: "Glow Berries" },
  { id: "melon", name: "Melon" },
  { id: "potato", name: "Potato" },
  { id: "sweet_berries", name: "Sweet Berries" },
  { id: "wheat", name: "Wheat" },
  { id: "frozen_kelp", name: "Frozen Kelp" },
  { id: "baked_potato", name: "Baked Potato" },
  { id: "charred_berries", name: "Charred Berries" },
  { id: "nether_wart", name: "Nether Wart" },
  { id: "glistering_melon", name: "Glistering Melon" },
  { id: "warped_roots", name: "Warped Roots" },
];

export const FISHING_INDIVIDUAL_CREATURE: FishingItemData[] = [
  { id: "chicken", name: "Chicken" },
  { id: "cow", name: "Cow" },
  { id: "creeper", name: "Creeper" },
  { id: "pig", name: "Pig" },
  { id: "sheep", name: "Sheep" },
  { id: "skeleton", name: "Skeleton" },
  { id: "slime", name: "Slime" },
  { id: "spider", name: "Spider" },
  { id: "squid", name: "Squid" },
  { id: "zombie", name: "Zombie" },
  { id: "blaze", name: "Blaze" },
  { id: "cave_spider", name: "Cave Spider" },
  { id: "magma_cube", name: "Magma Cube" },
  { id: "pig_zombie", name: "Pig Zombie" },
];

export const FISHING_INDIVIDUAL_ITEMS: Record<
  FishingCatchCategory,
  FishingItemData[]
> = {
  fish: FISHING_INDIVIDUAL_FISH,
  treasure: FISHING_INDIVIDUAL_TREASURE,
  junk: FISHING_INDIVIDUAL_JUNK,
  plant: FISHING_INDIVIDUAL_PLANT,
  creature: FISHING_INDIVIDUAL_CREATURE,
};

export class FishingEnvironmentStats {
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

  @Field()
  public mythical: number;

  @Field()
  public total: number;

  public constructor(data: APIData = {}) {
    this.fish = toNumber(data.fish);
    this.junk = toNumber(data.junk);
    this.treasure = toNumber(data.treasure);
    this.plant = toNumber(data.plant);
    this.creature = toNumber(data.creature);
    this.mythical = toNumber(data.orb);
    this.total = sum(
      this.fish,
      this.junk,
      this.treasure,
      this.plant,
      this.creature,
      this.mythical,
    );
  }
}

export class FishingEnchantment {
  @Field({ leaderboard: { enabled: false }})
  public name: string;

  @Field()
  public level: number;

  @Field({ leaderboard: { enabled: false }})
  public enabled: boolean;

  public constructor(
    name: string,
    data: APIData = {},
    fallbackToggle?: boolean,
  ) {
    this.name = name;
    this.level = toNumber(data.level);
    this.enabled =
      typeof data.toggle === "boolean"
        ? data.toggle
        : (fallbackToggle ?? false);
  }
}

export class FishingEnchantments {
  @Field()
  public luck: FishingEnchantment;

  @Field()
  public collector: FishingEnchantment;

  @Field()
  public dumpsterDiver: FishingEnchantment;

  @Field()
  public vulcansBlessing: FishingEnchantment;

  @Field()
  public neptunesFury: FishingEnchantment;

  @Field()
  public lure: FishingEnchantment;

  @Field()
  public mythicalHook: FishingEnchantment;

  @Field()
  public herbivore: FishingEnchantment;

  @Field()
  public landLine: FishingEnchantment;

  public constructor(
    data: APIData = {},
    mainLobby: APIData = {},
    globalFishing: APIData = {},
  ) {
    this.luck = new FishingEnchantment(
      "Luck",
      data.luck,
      mainLobby.fishing_enchant_LUCK_toggle,
    );
    this.collector = new FishingEnchantment(
      "Collector",
      data.collector,
      mainLobby.fishing_enchant_COLLECTOR_toggle,
    );
    this.dumpsterDiver = new FishingEnchantment(
      "Dumpster Diver",
      data.dumpster_diver,
      mainLobby.fishing_enchant_DUMPSTER_DIVER_toggle,
    );
    this.vulcansBlessing = new FishingEnchantment("Vulcan's Blessing", {
      level:
        data.vulcans_blessing?.level ??
        globalFishing.enchants?.vulcans_blessing?.level,
      toggle: data.vulcans_blessing?.toggle,
    });
    this.neptunesFury = new FishingEnchantment(
      "Neptune's Fury",
      data.neptunes_fury,
    );
    this.lure = new FishingEnchantment(
      "Lure",
      data.lure,
      mainLobby.fishing_enchant_LURE_toggle,
    );
    this.mythicalHook = new FishingEnchantment(
      "Mythical Hook",
      data.mythical_hook,
    );
    this.herbivore = new FishingEnchantment("Herbivore", data.herbivore);
    this.landLine = new FishingEnchantment("Land Line", data.land_line);
  }
}

export class FishingMythicalFish {
  @Field({ leaderboard: { enabled: false }})
  public id: string;

  @Field({ leaderboard: { enabled: false }})
  public name: string;

  @Field({ leaderboard: { enabled: false }})
  public rarity: string;

  @Field()
  public catches: number;

  @Field()
  public percentage: number;

  @Field()
  public maxWeight: number;

  @Field({ leaderboard: { enabled: false }})
  public maxed: boolean;

  public constructor(
    data: FishingMythicalData,
    catches: number,
    total: number,
    weight: number,
  ) {
    this.id = data.id;
    this.name = data.name;
    this.rarity = data.rarity;
    this.catches = catches;
    this.percentage = total > 0 ? catches / total : 0;
    this.maxWeight = weight;
    this.maxed = data.maxWeightCap > 0 && weight >= data.maxWeightCap;
  }
}

export class FishingCollectionItem {
  @Field({ leaderboard: { enabled: false }})
  public id: string;

  @Field({ leaderboard: { enabled: false }})
  public name: string;

  @Field({ leaderboard: { enabled: false }})
  public source: string;

  @Field({ leaderboard: { enabled: false }})
  public environment: string;

  @Field({ leaderboard: { enabled: false }})
  public requirement: string;

  @Field({ leaderboard: { enabled: false }})
  public unlocked: boolean;

  @Field({ leaderboard: { enabled: false }})
  public active: boolean;

  public constructor({
    id,
    name,
    source = "N/A",
    environment = "N/A",
    requirement = "N/A",
    unlocked = false,
    active = false,
  }: {
    id: string;
    name: string;
    source?: string;
    environment?: string;
    requirement?: string;
    unlocked?: boolean;
    active?: boolean;
  }) {
    this.id = id;
    this.name = name;
    this.source = source;
    this.environment = environment;
    this.requirement = requirement;
    this.unlocked = unlocked;
    this.active = active;
  }
}

export class FishingSeasonalEvent {
  @Field()
  public water: FishingEnvironmentStats;

  @Field()
  public lava: FishingEnvironmentStats;

  @Field()
  public ice: FishingEnvironmentStats;

  @Field()
  public total: number;

  public constructor(data: APIData = {}) {
    this.water = new FishingEnvironmentStats(data.water);
    this.lava = new FishingEnvironmentStats(data.lava);
    this.ice = new FishingEnvironmentStats(data.ice);
    this.total = sum(this.water.total, this.lava.total, this.ice.total);
  }
}

export class FishingSeasonalYear {
  @Field({ leaderboard: { enabled: false }})
  public year: string;

  @Field()
  public halloween: FishingSeasonalEvent;

  @Field()
  public christmas: FishingSeasonalEvent;

  @Field()
  public easter: FishingSeasonalEvent;

  @Field()
  public summer: FishingSeasonalEvent;

  @Field()
  public total: number;

  public constructor(year: string = "", data: APIData = {}) {
    this.year = year;
    this.halloween = new FishingSeasonalEvent(data.halloween);
    this.christmas = new FishingSeasonalEvent(data.christmas);
    this.easter = new FishingSeasonalEvent(data.easter);
    this.summer = new FishingSeasonalEvent(data.summer);
    this.total = sum(
      this.halloween.total,
      this.christmas.total,
      this.easter.total,
      this.summer.total,
    );
  }
}

export class FishingSeasonal {
  @Field({ type: () => [FishingSeasonalYear], leaderboard: { enabled: false }})
  public years: FishingSeasonalYear[];

  @Field()
  public halloween: number;

  @Field()
  public christmas: number;

  @Field()
  public easter: number;

  @Field()
  public summer: number;

  @Field()
  public total: number;

  public constructor(data: APIData = {}) {
    const dataYears = Object.keys(data).filter(isYearKey);
    const currentYear = new Date().getUTCFullYear();
    const lastYear = Math.max(
      currentYear,
      ...dataYears.map((year) => Number.parseInt(year, 10)),
    );

    const yearKeys: string[] = [];
    for (let year = FISHING_FIRST_YEAR; year <= lastYear; year++) {
      yearKeys.push(year.toString());
    }

    this.years = yearKeys.map(
      (year) => new FishingSeasonalYear(year, data[year]),
    );
    this.halloween = sum(...this.years.map((year) => year.halloween.total));
    this.christmas = sum(...this.years.map((year) => year.christmas.total));
    this.easter = sum(...this.years.map((year) => year.easter.total));
    this.summer = sum(...this.years.map((year) => year.summer.total));
    this.total = sum(this.halloween, this.christmas, this.easter, this.summer);
  }
}

export class FishingIndividualCatch {
  @Field({ leaderboard: { enabled: false }})
  public id: string;

  @Field({ leaderboard: { enabled: false }})
  public name: string;

  @Field()
  public catches: number;

  public constructor(item: FishingItemData, catches: number) {
    this.id = item.id;
    this.name = item.name;
    this.catches = catches;
  }
}

export class FishingIndividualCatches {
  @Field({ type: () => [FishingIndividualCatch], leaderboard: { enabled: false }})
  public fish: FishingIndividualCatch[];

  @Field({ type: () => [FishingIndividualCatch], leaderboard: { enabled: false }})
  public treasure: FishingIndividualCatch[];

  @Field({ type: () => [FishingIndividualCatch], leaderboard: { enabled: false }})
  public junk: FishingIndividualCatch[];

  @Field({ type: () => [FishingIndividualCatch], leaderboard: { enabled: false }})
  public plant: FishingIndividualCatch[];

  @Field({ type: () => [FishingIndividualCatch], leaderboard: { enabled: false }})
  public creature: FishingIndividualCatch[];

  public constructor(data: APIData = {}) {
    this.fish = FISHING_INDIVIDUAL_FISH.map(
      (item) =>
        new FishingIndividualCatch(item, toNumber(data.fish?.[item.id])),
    );
    this.treasure = FISHING_INDIVIDUAL_TREASURE.map(
      (item) =>
        new FishingIndividualCatch(item, toNumber(data.treasure?.[item.id])),
    );
    this.junk = FISHING_INDIVIDUAL_JUNK.map(
      (item) =>
        new FishingIndividualCatch(item, toNumber(data.junk?.[item.id])),
    );
    this.plant = FISHING_INDIVIDUAL_PLANT.map(
      (item) =>
        new FishingIndividualCatch(item, toNumber(data.plant?.[item.id])),
    );
    this.creature = FISHING_INDIVIDUAL_CREATURE.map(
      (item) =>
        new FishingIndividualCatch(item, toNumber(data.creature?.[item.id])),
    );
  }
}

export class FishingFireproofing {
  @Field()
  public scales: number;

  @Field()
  public sealant: number;

  @Field()
  public flame: number;

  public constructor(data: APIData = {}) {
    this.scales = toNumber(data.scales);
    this.sealant = toNumber(data.sealant);
    this.flame = toNumber(data.flame);
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

  @Field()
  public mythical: number;

  @Field()
  public special: number;

  @Field()
  public rods: number;

  @Field()
  public hookTrails: number;

  @Field()
  public water: FishingEnvironmentStats;

  @Field()
  public lava: FishingEnvironmentStats;

  @Field()
  public ice: FishingEnvironmentStats;

  @Field({ type: () => [FishingMythicalFish], leaderboard: { enabled: false }})
  public mythicals: FishingMythicalFish[];

  @Field({ type: () => [FishingCollectionItem], leaderboard: { enabled: false }})
  public specialFish: FishingCollectionItem[];

  @Field({ type: () => [FishingCollectionItem], leaderboard: { enabled: false }})
  public fishingRods: FishingCollectionItem[];

  @Field({ type: () => [FishingCollectionItem], leaderboard: { enabled: false }})
  public hookTrailCollection: FishingCollectionItem[];

  @Field()
  public seasonal: FishingSeasonal;

  @Field()
  public enchants: FishingEnchantments;

  @Field()
  public fireproofing: FishingFireproofing;

  @Field()
  public individual: FishingIndividualCatches;

  @Field({ leaderboard: { enabled: false }})
  public activeFishingRod: string;

  @Field({ leaderboard: { enabled: false }})
  public activeFishHookTrail: string;

  public constructor(
    mainLobby: APIData = {},
    achievements: APIData = {},
    globalFishing: APIData = {},
    settings: APIData = {},
  ) {
    const fishing = mainLobby.fishing ?? {};
    const packages = mainLobby.packages ?? [];
    const permanent = fishing.stats?.permanent ?? {};

    this.water = new FishingEnvironmentStats(permanent.water);
    this.lava = new FishingEnvironmentStats(permanent.lava);
    this.ice = new FishingEnvironmentStats(permanent.ice);

    this.fish = sum(this.water.fish, this.lava.fish, this.ice.fish);
    this.junk = sum(this.water.junk, this.lava.junk, this.ice.junk);
    this.treasure = sum(
      this.water.treasure,
      this.lava.treasure,
      this.ice.treasure,
    );
    this.plant = sum(this.water.plant, this.lava.plant, this.ice.plant);
    this.creature = sum(
      this.water.creature,
      this.lava.creature,
      this.ice.creature,
    );
    this.mythical = FISHING_MYTHICAL_FISH.reduce(
      (total, mythical) => total + toNumber(fishing.orbs?.[mythical.id]),
      0,
    );

    this.specialFish = FISHING_SPECIAL_FISH.map(
      (fish) =>
        new FishingCollectionItem({
          ...fish,
          environment: keyToName(fish.environment),
          unlocked: fishing.special_fish?.[fish.id] ?? false,
        }),
    );
    this.special = this.specialFish.filter((fish) => fish.unlocked).length;

    this.mythicals = FISHING_MYTHICAL_FISH.map(
      (mythical) =>
        new FishingMythicalFish(
          mythical,
          toNumber(fishing.orbs?.[mythical.id]),
          this.mythical,
          toNumber(fishing.orbs?.weight?.[mythical.id]),
        ),
    );

    this.totalCatches = sum(
      this.fish,
      this.junk,
      this.treasure,
      this.plant,
      this.creature,
      this.mythical,
      this.special,
    );

    this.activeFishingRod = fishing.activeFishingRod ?? "N/A";
    this.activeFishHookTrail =
      fishing.activeFishHookTrail ?? mainLobby.activeFishHookTrail ?? "N/A";

    this.fishingRods = Fishing.getFishingRods(fishing, packages);
    this.hookTrailCollection = this.getHookTrails(fishing, packages, permanent);
    this.rods = this.fishingRods.filter((rod) => rod.unlocked).length;
    this.hookTrails = this.hookTrailCollection.filter(
      (trail) => trail.unlocked,
    ).length;

    this.seasonal = new FishingSeasonal(fishing.stats);
    this.enchants = new FishingEnchantments(
      fishing.enchants,
      mainLobby,
      globalFishing,
    );

    this.fireproofing = new FishingFireproofing(fishing.fireproofing);
    this.individual = new FishingIndividualCatches(permanent.individual);

  }

  private static getFishingRods(fishing: APIData, packages: string[]) {
    const specialFish = fishing.special_fish ?? {};
    const creatures = fishing.stats?.permanent?.individual?.creature ?? {};
    const inauguralIceCatches = new FishingEnvironmentStats(
      fishing.stats?.["2022"]?.christmas?.ice,
    ).total;

    return FISHING_RODS.map((rod) => {
      const unlocked =
        rod.id === "fishing_rod_3000" ||
        hasPackage(packages, rod.id) ||
        (rod.id === "fishing_rod_inaugural_ice" && inauguralIceCatches > 0) ||
        (rod.id === "fishing_rod_overgrown" &&
          specialFish.poisonous_potato &&
          specialFish.golden_apple &&
          specialFish.burnt_plant) ||
        (rod.id === "fishing_rod_zoologist" && toNumber(creatures.squid) > 0);

      return new FishingCollectionItem({
        ...rod,
        unlocked,
        active: fishing.activeFishingRod === rod.id,
      });
    });
  }

  private getHookTrails(
    fishing: APIData,
    packages: string[],
    permanent: APIData,
  ) {
    const totalTreasure = sum(
      toNumber(permanent.water?.treasure),
      toNumber(permanent.lava?.treasure),
      toNumber(permanent.ice?.treasure),
    );
    const totalJunk = sum(
      toNumber(permanent.water?.junk),
      toNumber(permanent.lava?.junk),
      toNumber(permanent.ice?.junk),
    );
    const totalPlant = sum(
      toNumber(permanent.water?.plant),
      toNumber(permanent.lava?.plant),
      toNumber(permanent.ice?.plant),
    );
    const totalCreature = sum(
      toNumber(permanent.water?.creature),
      toNumber(permanent.lava?.creature),
      toNumber(permanent.ice?.creature),
    );

    return FISHING_HOOK_TRAILS.map((trail) => {
      const unlocked =
        hasPackage(packages, trail.id) ||
        (trail.id === "mainlobby_fishing_emerald" && this.mythical >= 500) ||
        (trail.id === "mainlobby_fishing_sparkle" && this.special >= 20) ||
        (trail.id === "mainlobby_fishing_treasure_sheen" &&
          totalTreasure >= 5000) ||
        (trail.id === "mainlobby_fishing_beloved_junk" && totalJunk >= 5000) ||
        (trail.id === "mainlobby_fishing_archimedes_trail" &&
          toNumber(fishing.orbs?.archimedes) >= 1) ||
        (trail.id === "mainlobby_fishing_hades_hook" &&
          toNumber(fishing.orbs?.hades) >= 5) ||
        (trail.id === "mainlobby_fishing_organic_material" &&
          totalPlant >= 1000) ||
        (trail.id === "mainlobby_fishing_creature_catch" &&
          totalCreature >= 1000);

      return new FishingCollectionItem({
        ...trail,
        unlocked,
        active: this.activeFishHookTrail === trail.id,
      });
    });
  }
}
