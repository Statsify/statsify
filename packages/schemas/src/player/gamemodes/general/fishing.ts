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
const totalPermanentStat = (
  permanent: APIData,
  stat: "treasure" | "junk" | "plant" | "creature"
) =>
  add(
    ...FISHING_ENVIRONMENTS.map((environment) =>
      toNumber(permanent[environment]?.[stat])
    )
  );

interface FishingSpecialFishData {
  id: string;
  source: string;
  environment: FishingEnvironment;
}

export const FISHING_SPECIAL_FISH: FishingSpecialFishData[] = [
  {
    id: "puffer_emoji",
    source: "Anytime",
    environment: "water",
  },
  { id: "nemo", source: "Anytime", environment: "water" },
  {
    id: "knockback_slimeball",
    source: "Anytime",
    environment: "water",
  },
  {
    id: "hot_potato",
    source: "Anytime",
    environment: "water",
  },
  {
    id: "fish_monger_suit_helmet",
    source: "Anytime",
    environment: "water",
  },
  {
    id: "fish_monger_suit_chestplate",
    source: "Anytime",
    environment: "water",
  },
  {
    id: "fish_monger_suit_leggings",
    source: "Anytime",
    environment: "water",
  },
  {
    id: "fish_monger_suit_boots",
    source: "Anytime",
    environment: "water",
  },
  { id: "barnacle", source: "Anytime", environment: "water" },
  {
    id: "leviathan",
    source: "Anytime",
    environment: "water",
  },
  {
    id: "star_eater_scales",
    source: "Anytime",
    environment: "water",
  },
  {
    id: "rubber_duck",
    source: "Anytime",
    environment: "water",
  },
  {
    id: "oops_the_fish",
    source: "Summer",
    environment: "water",
  },
  { id: "shark", source: "Summer", environment: "water" },
  { id: "sea_bass", source: "Summer", environment: "water" },
  {
    id: "sunscreen",
    source: "Summer",
    environment: "water",
  },
  {
    id: "pile_of_sand",
    source: "Summer",
    environment: "water",
  },
  {
    id: "mahi-mahi",
    source: "Summer",
    environment: "water",
  },
  {
    id: "mahi_mahi",
    source: "Summer",
    environment: "water",
  },
  {
    id: "lucent_bee_hive",
    source: "Summer",
    environment: "water",
  },
  {
    id: "spook_the_fish",
    source: "Halloween",
    environment: "water",
  },
  {
    id: "chocolate_bar",
    source: "Halloween",
    environment: "water",
  },
  {
    id: "pumpkin_spice_latte",
    source: "Halloween",
    environment: "water",
  },
  { id: "angler", source: "Halloween", environment: "water" },
  {
    id: "pumpkin_pie",
    source: "Halloween",
    environment: "water",
  },
  { id: "eyeball", source: "Halloween", environment: "water" },
  {
    id: "wayfinders_compass",
    source: "Halloween",
    environment: "water",
  },
  {
    id: "molten_iron",
    source: "Halloween",
    environment: "lava",
  },
  {
    id: "regular_fish",
    source: "Halloween",
    environment: "lava",
  },
  {
    id: "lava_shark",
    source: "Halloween",
    environment: "lava",
  },
  {
    id: "chill_the_fish_3",
    source: "Holiday",
    environment: "water",
  },
  {
    id: "frozen_fish",
    source: "Holiday",
    environment: "ice",
  },
  {
    id: "festival_pufferfish_hat",
    source: "Holiday",
    environment: "water",
  },
  { id: "eggnog", source: "Holiday", environment: "water" },
  {
    id: "dawning_snowball",
    source: "Holiday",
    environment: "ice",
  },
  {
    id: "frozen_meal",
    source: "Holiday",
    environment: "ice",
  },
  {
    id: "festive_lights",
    source: "Holiday",
    environment: "ice",
  },
  {
    id: "egg_the_fish",
    source: "Easter",
    environment: "water",
  },
  {
    id: "cracked_egg",
    source: "Easter",
    environment: "water",
  },
  { id: "raw_ham", source: "Easter", environment: "water" },
  { id: "carrot", source: "Easter", environment: "water" },
  {
    id: "soggy_hot_cross_bun",
    source: "Easter",
    environment: "water",
  },
  {
    id: "clay_ball",
    source: "Easter",
    environment: "water",
  },
  { id: "rose", source: "Easter", environment: "water" },
  {
    id: "cherry_blossom",
    source: "Easter",
    environment: "water",
  },
  {
    id: "poisonous_potato",
    source: "Fishing Friday",
    environment: "water",
  },
  {
    id: "golden_apple",
    source: "Fishing Friday",
    environment: "water",
  },
  {
    id: "burnt_plant",
    source: "Dense Vegetation",
    environment: "lava",
  },
];

interface FishingMythicalData {
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

interface FishingRodData {
  id: string;
  requirement: string;
}

export const FISHING_RODS: FishingRodData[] = [
  {
    id: "fishing_rod_3000",
    requirement: "Default fishing rod",
  },
  {
    id: "fishing_rod_inaugural_ice",
    requirement: "Holidays 2022 limited item",
  },
  {
    id: "fishing_rod_springtime",
    requirement: "Spring Fishing Reward",
  },
  {
    id: "fishing_rod_haunted",
    requirement: "Halloween Fishing Reward",
  },
  {
    id: "fishing_rod_festive",
    requirement: "Holidays Fishing Reward",
  },
  {
    id: "fishing_rod_solar",
    requirement: "Summer Fishing Reward",
  },
  {
    id: "fishing_rod_overgrown",
    requirement: "Poisonous Potato, Golden Apple, Burnt Plant",
  },
  {
    id: "fishing_rod_zoologist",
    requirement: "Catch 1 squid during Creatures modifier",
  },
];

interface FishingHookTrailData {
  id: string;
  requirement: string;
}

export const FISHING_HOOK_TRAILS: FishingHookTrailData[] = [
  {
    id: "mainlobby_fishing_emerald",
    requirement: "Catch 500 Mythical Fish",
  },
  {
    id: "mainlobby_fishing_sparkle",
    requirement: "Catch 20 Special Fish",
  },
  {
    id: "mainlobby_fishing_treasure_sheen",
    requirement: "Catch 5,000 Treasure Items",
  },
  {
    id: "mainlobby_fishing_beloved_junk",
    requirement: "Catch 5,000 Junk Items",
  },
  {
    id: "mainlobby_fishing_archimedes_trail",
    requirement: "Catch Automaton of Daedalus 1 time",
  },
  {
    id: "mainlobby_fishing_hades_hook",
    requirement: "Catch Wrath Of Hades 5 times",
  },
  {
    id: "mainlobby_fishing_helios_breath",
    requirement: "Event Shop",
  },
  {
    id: "mainlobby_fishing_organic_material",
    requirement: "Catch 1,000 Plants",
  },
  {
    id: "mainlobby_fishing_creature_catch",
    requirement: "Catch 1,000 Creatures",
  },
  {
    id: "mainlobby_fishing_neptune_grace",
    requirement: "Event Shop",
  },
  {
    id: "mainlobby_fishing_ominous_rain",
    requirement: "Event Shop",
  },
];

type FishingCatchCategory =
  | "fish" |
  "treasure" |
  "junk" |
  "plant" |
  "creature";

interface FishingItemData {
  id: string;
}

const FISHING_INDIVIDUAL_FISH: FishingItemData[] = [
  { id: "salmon" },
  { id: "clownfish" },
  { id: "cooked_salmon" },
  { id: "charred_pufferfish" },
  { id: "cooked_cod" },
  { id: "pufferfish" },
  { id: "cod" },
  { id: "trout" },
  { id: "pike" },
  { id: "perch" },
  { id: "kelp" },
];

const FISHING_INDIVIDUAL_TREASURE: FishingItemData[] = [
  { id: "eye_of_ender" },
  { id: "molten_gold" },
  { id: "blaze_powder" },
  { id: "gold_sword" },
  { id: "name_tag" },
  { id: "enchanted_book" },
  { id: "diamond" },
  { id: "compass" },
  { id: "gold_pickaxe" },
  { id: "emerald" },
  { id: "enchanted_fishing_rod" },
  { id: "enchanted_bow" },
  { id: "saddle" },
  { id: "diamond_sword" },
  { id: "magma_cream" },
  { id: "blaze_rod" },
  { id: "chainmail_chestplate" },
  { id: "iron_sword" },
  { id: "nautilus_shell" },
];

const FISHING_INDIVIDUAL_JUNK: FishingItemData[] = [
  { id: "charcoal" },
  { id: "soggy_paper" },
  { id: "ink_sac" },
  { id: "broken_fishing_rod" },
  { id: "water_bottle" },
  { id: "bowl" },
  { id: "rotten_flesh" },
  { id: "string" },
  { id: "rabbit_hide" },
  { id: "leather" },
  { id: "lily_pad" },
  { id: "bone" },
  { id: "leather_boots" },
  { id: "tripwire_hook" },
  { id: "stick" },
  { id: "coal" },
  { id: "fermented_spider_eye" },
  { id: "burned_flesh" },
  { id: "steak" },
  { id: "nether_brick" },
  { id: "lava_bucket" },
  { id: "clump_of_leaves" },
  { id: "frozen_flesh" },
  { id: "snowball" },
  { id: "ice_shard" },
];

const FISHING_INDIVIDUAL_PLANT: FishingItemData[] = [
  { id: "kelp" },
  { id: "bamboo" },
  { id: "dried_kelp" },
  { id: "glow_berries" },
  { id: "melon" },
  { id: "potato" },
  { id: "sweet_berries" },
  { id: "wheat" },
  { id: "frozen_kelp" },
  { id: "baked_potato" },
  { id: "charred_berries" },
  { id: "nether_wart" },
  { id: "glistering_melon" },
  { id: "warped_roots" },
];

const FISHING_INDIVIDUAL_CREATURE: FishingItemData[] = [
  { id: "chicken" },
  { id: "cow" },
  { id: "creeper" },
  { id: "pig" },
  { id: "sheep" },
  { id: "skeleton" },
  { id: "slime" },
  { id: "spider" },
  { id: "squid" },
  { id: "zombie" },
  { id: "blaze" },
  { id: "cave_spider" },
  { id: "magma_cube" },
  { id: "pig_zombie" },
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
    this.total = add(
      this.fish,
      this.junk,
      this.treasure,
      this.plant,
      this.creature,
      this.mythical
    );
  }
}

export class FishingEnchantment {
  @Field()
  public level: number;

  @Field({ leaderboard: { enabled: false } })
  public enabled: boolean;

  public constructor(data: APIData = {}, fallbackToggle?: boolean) {
    this.level = toNumber(data.level);
    this.enabled =
      typeof data.toggle === "boolean" ?
        data.toggle :
        (fallbackToggle ?? false);
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
    globalFishing: APIData = {}
  ) {
    this.luck = new FishingEnchantment(
      data.luck,
      mainLobby.fishing_enchant_LUCK_toggle
    );
    this.collector = new FishingEnchantment(
      data.collector,
      mainLobby.fishing_enchant_COLLECTOR_toggle
    );
    this.dumpsterDiver = new FishingEnchantment(
      data.dumpster_diver,
      mainLobby.fishing_enchant_DUMPSTER_DIVER_toggle
    );
    this.vulcansBlessing = new FishingEnchantment({
      level:
        data.vulcans_blessing?.level ??
        globalFishing.enchants?.vulcans_blessing?.level,
      toggle: data.vulcans_blessing?.toggle,
    });
    this.neptunesFury = new FishingEnchantment(data.neptunes_fury);
    this.lure = new FishingEnchantment(
      data.lure,
      mainLobby.fishing_enchant_LURE_toggle
    );
    this.mythicalHook = new FishingEnchantment(data.mythical_hook);
    this.herbivore = new FishingEnchantment(data.herbivore);
    this.landLine = new FishingEnchantment(data.land_line);
  }
}

export class FishingMythicalFish {
  @Field()
  public catches: number;

  @Field()
  public maxWeight: number;

  public constructor(catches: number, weight: number) {
    this.catches = catches;
    this.maxWeight = weight;
  }
}

export class FishingCollectionItem {
  @Field({ leaderboard: { enabled: false } })
  public unlocked: boolean;

  @Field({ leaderboard: { enabled: false } })
  public active: boolean;

  public constructor({
    unlocked = false,
    active = false,
  }: {
    unlocked?: boolean;
    active?: boolean;
  }) {
    this.unlocked = unlocked;
    this.active = active;
  }
}

export class FishingUnlockableItem {
  @Field({ leaderboard: { enabled: false } })
  public unlocked: boolean;

  public constructor(unlocked = false) {
    this.unlocked = unlocked;
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
    this.total = add(
      ...FISHING_ENVIRONMENTS.map((environment) => this[environment].total)
    );
  }
}

export class FishingSeasonalYear {
  @Field({ leaderboard: { enabled: false } })
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
    this.total = add(...FISHING_EVENTS.map((event) => this[event].total));
  }
}

export class FishingSeasonal {
  @Field({ type: () => [FishingSeasonalYear], leaderboard: { enabled: false } })
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
      ...dataYears.map((year) => Number.parseInt(year, 10))
    );

    const yearKeys: string[] = [];
    for (let year = FISHING_FIRST_YEAR; year <= lastYear; year++) {
      yearKeys.push(year.toString());
    }

    this.years = yearKeys.map(
      (year) => new FishingSeasonalYear(year, data[year])
    );
    this.halloween = add(...this.years.map((year) => year.halloween.total));
    this.christmas = add(...this.years.map((year) => year.christmas.total));
    this.easter = add(...this.years.map((year) => year.easter.total));
    this.summer = add(...this.years.map((year) => year.summer.total));
    this.total = add(this.halloween, this.christmas, this.easter, this.summer);
  }
}

export class FishingIndividualCatch {
  @Field()
  public catches: number;

  public constructor(catches: number) {
    this.catches = catches;
  }
}

const getIndividualCatches = (
  category: FishingCatchCategory,
  data: APIData = {}
) =>
  FISHING_INDIVIDUAL_ITEMS[category].map(
    (item) => new FishingIndividualCatch(toNumber(data[category]?.[item.id]))
  );

export class FishingIndividualCatches {
  @Field({ type: () => [FishingIndividualCatch], leaderboard: { enabled: false } })
  public fish: FishingIndividualCatch[];

  @Field({ type: () => [FishingIndividualCatch], leaderboard: { enabled: false } })
  public treasure: FishingIndividualCatch[];

  @Field({ type: () => [FishingIndividualCatch], leaderboard: { enabled: false } })
  public junk: FishingIndividualCatch[];

  @Field({ type: () => [FishingIndividualCatch], leaderboard: { enabled: false } })
  public plant: FishingIndividualCatch[];

  @Field({ type: () => [FishingIndividualCatch], leaderboard: { enabled: false } })
  public creature: FishingIndividualCatch[];

  public constructor(data: APIData = {}) {
    this.fish = getIndividualCatches("fish", data);
    this.treasure = getIndividualCatches("treasure", data);
    this.junk = getIndividualCatches("junk", data);
    this.plant = getIndividualCatches("plant", data);
    this.creature = getIndividualCatches("creature", data);
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

  @Field({ type: () => [FishingMythicalFish], leaderboard: { enabled: false } })
  public mythicals: FishingMythicalFish[];

  @Field({ type: () => [FishingUnlockableItem], leaderboard: { enabled: false } })
  public specialFish: FishingUnlockableItem[];

  @Field({ type: () => [FishingCollectionItem], leaderboard: { enabled: false } })
  public fishingRods: FishingCollectionItem[];

  @Field({ type: () => [FishingCollectionItem], leaderboard: { enabled: false } })
  public hookTrailCollection: FishingCollectionItem[];

  @Field()
  public seasonal: FishingSeasonal;

  @Field()
  public enchants: FishingEnchantments;

  @Field()
  public fireproofing: FishingFireproofing;

  @Field()
  public individual: FishingIndividualCatches;

  @Field({ leaderboard: { enabled: false } })
  public activeFishingRod: string;

  @Field({ leaderboard: { enabled: false } })
  public activeFishHookTrail: string;

  public constructor(
    mainLobby: APIData = {},
    _achievements: APIData = {},
    globalFishing: APIData = {},
  ) {
    const fishing = mainLobby.fishing ?? {};
    const packages = mainLobby.packages ?? [];
    const permanent = fishing.stats?.permanent ?? {};

    this.water = new FishingEnvironmentStats(permanent.water);
    this.lava = new FishingEnvironmentStats(permanent.lava);
    this.ice = new FishingEnvironmentStats(permanent.ice);

    const environments = FISHING_ENVIRONMENTS.map(
      (environment) => this[environment]
    );

    this.fish = add(...environments.map((environment) => environment.fish));
    this.junk = add(...environments.map((environment) => environment.junk));
    this.treasure = add(
      ...environments.map((environment) => environment.treasure)
    );
    this.plant = add(...environments.map((environment) => environment.plant));
    this.creature = add(
      ...environments.map((environment) => environment.creature)
    );
    this.mythical = add(
      ...FISHING_MYTHICAL_FISH.map((mythical) =>
        toNumber(fishing.orbs?.[mythical.id])
      )
    );

    this.specialFish = FISHING_SPECIAL_FISH.map(
      (fish) => new FishingUnlockableItem(fishing.special_fish?.[fish.id] ?? false)
    );
    this.special = this.specialFish.filter((fish) => fish.unlocked).length;

    this.mythicals = FISHING_MYTHICAL_FISH.map(
      (mythical) =>
        new FishingMythicalFish(
          toNumber(fishing.orbs?.[mythical.id]),
          toNumber(fishing.orbs?.weight?.[mythical.id])
        )
    );

    this.totalCatches = add(
      this.fish,
      this.junk,
      this.treasure,
      this.plant,
      this.creature,
      this.mythical,
      this.special
    );

    this.activeFishingRod = fishing.activeFishingRod ?? "N/A";
    this.activeFishHookTrail =
      fishing.activeFishHookTrail ?? mainLobby.activeFishHookTrail ?? "N/A";

    this.fishingRods = this.getFishingRods(fishing, packages);
    this.hookTrailCollection = this.getHookTrails(fishing, packages, permanent);
    this.rods = this.fishingRods.filter((rod) => rod.unlocked).length;
    this.hookTrails = this.hookTrailCollection.filter(
      (trail) => trail.unlocked
    ).length;

    this.seasonal = new FishingSeasonal(fishing.stats);
    this.enchants = new FishingEnchantments(
      fishing.enchants,
      mainLobby,
      globalFishing
    );

    this.fireproofing = new FishingFireproofing(fishing.fireproofing);
    this.individual = new FishingIndividualCatches(permanent.individual);
  }

  private getFishingRods(fishing: APIData, packages: string[]) {
    const specialFish = fishing.special_fish ?? {};
    const creatures = fishing.stats?.permanent?.individual?.creature ?? {};
    const inauguralIceCatches = new FishingEnvironmentStats(
      fishing.stats?.["2022"]?.christmas?.ice
    ).total;
    const hasOvergrownRequirements =
      specialFish.poisonous_potato &&
      specialFish.golden_apple &&
      specialFish.burnt_plant;
    const hasZoologistRequirements = toNumber(creatures.squid) > 0;

    return FISHING_RODS.map((rod) => {
      const unlocked =
        rod.id === "fishing_rod_3000" ||
        hasPackage(packages, rod.id) ||
        (rod.id === "fishing_rod_inaugural_ice" && inauguralIceCatches > 0) ||
        (rod.id === "fishing_rod_overgrown" && hasOvergrownRequirements) ||
        (rod.id === "fishing_rod_zoologist" && hasZoologistRequirements);

      return new FishingCollectionItem({
        unlocked,
        active: fishing.activeFishingRod === rod.id,
      });
    });
  }

  private getHookTrails(
    fishing: APIData,
    packages: string[],
    permanent: APIData
  ) {
    const totalTreasure = totalPermanentStat(permanent, "treasure");
    const totalJunk = totalPermanentStat(permanent, "junk");
    const totalPlant = totalPermanentStat(permanent, "plant");
    const totalCreature = totalPermanentStat(permanent, "creature");

    return FISHING_HOOK_TRAILS.map((trail) => {
      const unlockedByStats = (() => {
        switch (trail.id) {
          case "mainlobby_fishing_emerald":
            return this.mythical >= 500;

          case "mainlobby_fishing_sparkle":
            return this.special >= 20;

          case "mainlobby_fishing_treasure_sheen":
            return totalTreasure >= 5000;

          case "mainlobby_fishing_beloved_junk":
            return totalJunk >= 5000;

          case "mainlobby_fishing_archimedes_trail":
            return toNumber(fishing.orbs?.archimedes) >= 1;

          case "mainlobby_fishing_hades_hook":
            return toNumber(fishing.orbs?.hades) >= 5;

          case "mainlobby_fishing_organic_material":
            return totalPlant >= 1000;

          case "mainlobby_fishing_creature_catch":
            return totalCreature >= 1000;

          default:
            return false;
        }
      })();
      const unlocked = hasPackage(packages, trail.id) || unlockedByStats;

      return new FishingCollectionItem({
        unlocked,
        active: this.activeFishHookTrail === trail.id,
      });
    });
  }
}
