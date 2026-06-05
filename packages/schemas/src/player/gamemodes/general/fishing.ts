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
type FishingEvent = "halloween" | "christmas" | "easter" | "summer";
type FishingYear = "2022" | "2023" | "2024" | "2025" | "2026";

const FISHING_YEARS: FishingYear[] = ["2022", "2023", "2024", "2025", "2026"];
const FISHING_EVENTS: FishingEvent[] = [
  "halloween",
  "christmas",
  "easter",
  "summer",
];
const FISHING_ENVIRONMENTS: FishingEnvironment[] = ["water", "lava", "ice"];

const fieldOptions = {
  leaderboard: { name: "Fishing" },
  historical: { enabled: false },
};

const collectionFieldOptions = {
  leaderboard: { enabled: false },
  historical: { enabled: false },
};

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
    name: "Fish Monger Suit Helmet",
    source: "Anytime",
    environment: "water",
  },
  {
    id: "fish_monger_suit_chestplate",
    name: "Fish Monger Suit Chestplate",
    source: "Anytime",
    environment: "water",
  },
  {
    id: "fish_monger_suit_leggings",
    name: "Fish Monger Suit Leggings",
    source: "Anytime",
    environment: "water",
  },
  {
    id: "fish_monger_suit_boots",
    name: "Fish Monger Suit Boots",
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

export class FishingEnvironmentStats {
  @Field(fieldOptions)
  public fish: number;

  @Field(fieldOptions)
  public junk: number;

  @Field(fieldOptions)
  public treasure: number;

  @Field(fieldOptions)
  public plant: number;

  @Field(fieldOptions)
  public creature: number;

  @Field(fieldOptions)
  public mythical: number;

  @Field(fieldOptions)
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
  @Field(collectionFieldOptions)
  public name: string;

  @Field(fieldOptions)
  public level: number;

  @Field(collectionFieldOptions)
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
  @Field(collectionFieldOptions)
  public id: string;

  @Field(collectionFieldOptions)
  public name: string;

  @Field(collectionFieldOptions)
  public rarity: string;

  @Field(fieldOptions)
  public catches: number;

  @Field(fieldOptions)
  public percentage: number;

  @Field(fieldOptions)
  public maxWeight: number;

  @Field(collectionFieldOptions)
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
  @Field(collectionFieldOptions)
  public id: string;

  @Field(collectionFieldOptions)
  public name: string;

  @Field(collectionFieldOptions)
  public source: string;

  @Field(collectionFieldOptions)
  public environment: string;

  @Field(collectionFieldOptions)
  public requirement: string;

  @Field(collectionFieldOptions)
  public unlocked: boolean;

  @Field(collectionFieldOptions)
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

  @Field(fieldOptions)
  public total: number;

  public constructor(data: APIData = {}) {
    this.water = new FishingEnvironmentStats(data.water);
    this.lava = new FishingEnvironmentStats(data.lava);
    this.ice = new FishingEnvironmentStats(data.ice);
    this.total = sum(this.water.total, this.lava.total, this.ice.total);
  }
}

export class FishingSeasonalYear {
  @Field()
  public halloween: FishingSeasonalEvent;

  @Field()
  public christmas: FishingSeasonalEvent;

  @Field()
  public easter: FishingSeasonalEvent;

  @Field()
  public summer: FishingSeasonalEvent;

  @Field(fieldOptions)
  public total: number;

  public constructor(data: APIData = {}) {
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
  @Field()
  public year2022: FishingSeasonalYear;

  @Field()
  public year2023: FishingSeasonalYear;

  @Field()
  public year2024: FishingSeasonalYear;

  @Field()
  public year2025: FishingSeasonalYear;

  @Field()
  public year2026: FishingSeasonalYear;

  @Field(collectionFieldOptions)
  public hasData: boolean;

  public constructor(data: APIData = {}) {
    this.year2022 = new FishingSeasonalYear(data["2022"]);
    this.year2023 = new FishingSeasonalYear(data["2023"]);
    this.year2024 = new FishingSeasonalYear(data["2024"]);
    this.year2025 = new FishingSeasonalYear(data["2025"]);
    this.year2026 = new FishingSeasonalYear(data["2026"]);
    this.hasData = FISHING_YEARS.some((year) =>
      FISHING_EVENTS.some((event) =>
        FISHING_ENVIRONMENTS.some(
          (environment) =>
            new FishingEnvironmentStats(data[year]?.[event]?.[environment])
              .total > 0,
        ),
      ),
    );
  }
}

export class FishingFireproofing {
  @Field(fieldOptions)
  public scales: number;

  @Field(fieldOptions)
  public sealant: number;

  @Field(fieldOptions)
  public flame: number;

  public constructor(data: APIData = {}) {
    this.scales = toNumber(data.scales);
    this.sealant = toNumber(data.sealant);
    this.flame = toNumber(data.flame);
  }
}

export class FishingIceProgression {
  @Field(collectionFieldOptions)
  public spokenToNereid: boolean;

  public constructor(data: APIData = {}) {
    this.spokenToNereid = data.spokenToNereid ?? false;
  }
}

export class Fishing {
  @Field(fieldOptions)
  public totalCatches: number;

  @Field(fieldOptions)
  public fish: number;

  @Field(fieldOptions)
  public junk: number;

  @Field(fieldOptions)
  public treasure: number;

  @Field(fieldOptions)
  public plant: number;

  @Field(fieldOptions)
  public creature: number;

  @Field(fieldOptions)
  public mythical: number;

  @Field(fieldOptions)
  public special: number;

  @Field(fieldOptions)
  public rods: number;

  @Field(fieldOptions)
  public hookTrails: number;

  @Field()
  public water: FishingEnvironmentStats;

  @Field()
  public lava: FishingEnvironmentStats;

  @Field()
  public ice: FishingEnvironmentStats;

  @Field({ type: () => [FishingMythicalFish], ...collectionFieldOptions })
  public mythicals: FishingMythicalFish[];

  @Field({ type: () => [FishingCollectionItem], ...collectionFieldOptions })
  public specialFish: FishingCollectionItem[];

  @Field({ type: () => [FishingCollectionItem], ...collectionFieldOptions })
  public fishingRods: FishingCollectionItem[];

  @Field({ type: () => [FishingCollectionItem], ...collectionFieldOptions })
  public hookTrailCollection: FishingCollectionItem[];

  @Field()
  public seasonal: FishingSeasonal;

  @Field()
  public enchants: FishingEnchantments;

  @Field()
  public fireproofing: FishingFireproofing;

  @Field()
  public iceProgression: FishingIceProgression;

  @Field(collectionFieldOptions)
  public activeFishingRod: string;

  @Field(collectionFieldOptions)
  public activeFishHookTrail: string;

  @Field(collectionFieldOptions)
  public fishCollectorShowCaught: boolean;

  @Field(collectionFieldOptions)
  public simplifiedIcons: boolean;

  @Field(collectionFieldOptions)
  public fishingRewardTracked: string;

  @Field(collectionFieldOptions)
  public leaderboardFishingType: string;

  @Field(fieldOptions)
  public luckiestOfTheSea: number;

  @Field(fieldOptions)
  public masterLure: number;

  @Field(fieldOptions)
  public trashiestDiver: number;

  @Field(fieldOptions)
  public summerGoneFishing: number;

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
    this.iceProgression = new FishingIceProgression(fishing.ice);

    this.fishCollectorShowCaught =
      fishing.settings?.fishCollectorShowCaught ??
      settings.fishCollectorShowCaught ??
      false;
    this.simplifiedIcons = fishing.settings?.simplifiedIcons ?? false;
    this.fishingRewardTracked = mainLobby.fishing_reward_tracked ?? "N/A";
    this.leaderboardFishingType =
      mainLobby.leaderboardSettings?.fishingType ?? "N/A";

    this.luckiestOfTheSea = toNumber(achievements.general_luckiest_of_the_sea);
    this.masterLure = toNumber(achievements.general_master_lure);
    this.trashiestDiver = toNumber(achievements.general_trashiest_diver);
    this.summerGoneFishing = toNumber(achievements.summer_gone_fishing);
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
