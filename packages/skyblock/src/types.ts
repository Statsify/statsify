/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import type { AuctionStat } from "./sections/misc.js";
import type { Catch, TrophyTier } from "./sections/fishing.js";
import type { DungeonClass } from "./sections/dungeons.js";
import type { Experiment } from "./sections/experiments.js";
import type { Faction } from "./sections/crimson.js";
import type { JacobBracket, JacobMedal } from "./sections/jacob.js";
import type { Powder } from "./sections/hotm.js";
import type { Whisper } from "./sections/hotf.js";
import type { Skill } from "./sections/skills.js";
import type { SlayerBoss } from "./sections/slayers.js";
import type { StatSource } from "./sections/stats.js";

export const RARITIES = [
  "COMMON",
  "UNCOMMON",
  "RARE",
  "EPIC",
  "LEGENDARY",
  "MYTHIC",
  "DIVINE",
  "SPECIAL",
  "VERY_SPECIAL",
  "ULTIMATE",
  "ADMIN",
] as const;

export type Rarity = (typeof RARITIES)[number];
export type GameMode = "normal" | "ironman" | "stranded" | "bingo";

export interface Freshness {
  fetchedAt: number;
  // A stale copy is served only because its refetch failed.
  stale: boolean;
}

export interface PlayerRef {
  uuid: string;
  username: string;
  displayName: string;
}

export interface SkyBlockProfilesView extends PlayerRef, Freshness {
  profiles: ProfileSummary[];
}

export interface ProfileSummary {
  id: string;
  cuteName: string;
  gameMode: GameMode;
  selected: boolean;
  members: { uuid: string; removed: boolean }[];
  level: number;
  levelColor: string;
  xp: number;
  // A new profile shows missing data as empty, not as an API setting that's off.
  newProfile: boolean;
  purse: number;
  bank?: number;
  personalBank?: number;
  firstJoin?: number;
  fairySouls: number;
}

export interface SkyBlockProfileView
  extends PlayerRef, Freshness, ProfileSummary {
  member: MemberView;
  museumFetchedAt?: number;
  gardenFetchedAt?: number;
  // Sections asked for but left out until the price map and items are built.
  marketDown?: Exclude<keyof MemberView, "apiSettings">[];
}

// A null section is one the player's API settings hide.
export interface MemberView {
  apiSettings: ApiSettings;
  accessories?: AccessoriesSection | null;
  skills?: SkillsSection | null;
  pets?: PetsSection;
  hotm?: HotmSection;
  dungeons?: DungeonsSection;
  slayers?: SlayersSection;
  networth?: NetworthSection;
  level?: SkyBlockLevelSection;
  crimson?: CrimsonSection | null;
  fishing?: FishingSection | null;
  jacob?: JacobSection | null;
  garden?: GardenSection;
  chocolate?: ChocolateSection | null;
  hotf?: HotfSection | null;
  gear?: GearSection | null;
  inventories?: InventoriesSection | null;
  // The museum is null when none was fetched or nothing is donated.
  museum?: MuseumView | null;
  experiments?: ExperimentsSection | null;
  rift?: RiftSection | null;
  misc?: MiscSection;
  stats?: StatsSection;
}

// An inventory's slots, in the game's order.
export type Slots = (ItemView | null)[];

export interface GearSection {
  // Armor goes from helmet to boots.
  armor: Slots;
  // Equipment goes necklace, cloak, belt, then gloves.
  equipment: Slots;
  wardrobe: { slot: number; armor: Slots }[];
  wardrobeSlot?: number;
  weapons: ItemView[];
}

// The display entry lists these and can't import the NBT-decoding section.
export const INVENTORIES = [
  "inventory",
  "enderChest",
  "backpacks",
  "personalVault",
  "accessoryBag",
  "potionBag",
  "fishingBag",
  "quiver",
  "sacksBag",
] as const;

export type InventoryId = (typeof INVENTORIES)[number];

export interface InventoriesSection {
  // personalVault is missing with its own API setting off.
  pages: Partial<Record<InventoryId, Slots[]>>;
  // Backpack icons follow the order of pages.backpacks.
  backpackIcons: (ItemView | null)[];
  // Sacks sort largest first.
  sacks: {
    id: string;
    name: string;
    count: number;
    rarity?: Rarity;
    glint: boolean;
    texture?: ItemTexture;
  }[];
}

export interface MuseumView {
  value: number;
  appraisal: boolean;
  // An id is an item or an armor set.
  items: { id: string; category?: string; donatedAt?: number; items: Slots }[];
  special: { donatedAt?: number; items: Slots }[];
  // Categories sort by the most donated first.
  donated: { category: string; count: number }[];
}

export interface ApiSettings {
  skills: boolean;
  inventory: boolean;
  personalVault: boolean;
  collections: boolean;
  banking: boolean;
  museum?: boolean;
}

export interface Level {
  level: number;
  maxLevel: number;
  xp: number;
  // At the max level, this is all the XP past it.
  xpCurrent: number;
  xpForNext?: number;
  progress: number;
}

export interface SkillLevel extends Level {
  // The API can't confirm some caps, like Foraging past 53.
  unverified: boolean;
}

export interface SkillsSection {
  average: number;
  skills: Record<Skill, SkillLevel>;
}

export interface SlayersSection {
  xp: number;
  // Each boss's kills start at tier 1, so tier 1 is index 0.
  bosses: Record<SlayerBoss, { level: Level; kills: number[] }>;
}

export type DungeonGrade = "S+" | "S" | "A" | "B" | "C" | "D";

export interface DungeonFloor {
  floor: number;
  played: number;
  completions: number;
  best?: { score: number; grade: DungeonGrade };
  fastest?: number;
  fastestS?: number;
  fastestSPlus?: number;
  mobsKilled: number;
  // The most mobs killed and healing are each in one run.
  mostMobsKilled?: number;
  mostHealing?: number;
  milestoneCompletions: number;
}

export interface DungeonsSection {
  catacombs: Level;
  classes: Record<DungeonClass, Level>;
  classAverage: number;
  classXp: number;
  selectedClass?: string;
  secrets: number;
  secretsPerRun: number;
  floors: Record<"normal" | "master", DungeonFloor[]>;
  highestFloor: Partial<Record<"normal" | "master", number>>;
  mostDamage: Record<"normal" | "master", Record<DungeonClass, number>>;
  watcherKills: number;
  essence: Essence[];
}

export interface Essence {
  type: string;
  // Hypixel sends no balance for some shops.
  amount?: number;
  perks: number;
  maxPerks: number;
}

export interface HotmSection {
  level: Level;
  coreLevel: number;
  loadout: { selected: number; total: number };
  tokens: { spent: number; total: number };
  ability?: string;
  // The total is all ever earned, not what's left.
  powder: Record<Powder, { total: number; spent: number }>;
  nodes: TreeNode[];
  crystals: { found: number; placed: number; gems: Crystal[] };
  nucleusRuns: number;
  kingQuests: number;
  glacite: {
    corpses: number;
    corpsesByType: { type: string; count: number }[];
    fossils: number;
    fossilDust: number;
    mineshafts: number;
  };
}

// Only the Crystal Nucleus's five gems count placed crystals.
export interface Crystal {
  gem: string;
  found: number;
  placed?: number;
}

export interface TreeNode {
  id: string;
  name: string;
  level: number;
  maxLevel: number;
  x: number;
  y: number;
  enabled: boolean;
}

export type TreeLayout = Record<
  string,
  {
    name: string;
    x: number;
    y: number;
    maxLevel: number;
    stats?: { id: PlayerStat; base: number; perLevel: number }[];
  }
>;

export interface HotfSection {
  level: Level;
  centerLevel: number;
  loadout: { selected: number; total: number };
  tokens: { spent: number };
  ability?: string;
  // Spent counts the selected loadout's only.
  whispers: Record<Whisper, { total: number; spent: number }>;
  nodes: TreeNode[];
}

export interface CrimsonSection {
  faction?: Faction;
  reputation: Record<Faction, number>;
  kuudra: KuudraTier[];
  dojo: { test: string; points: number }[];
  dojoPoints: number;
  minibosses: { boss: string; kills: number }[];
}

// The API calls the basic tier "none".
export const KUUDRA_TIERS = [
  "none",
  "hot",
  "burning",
  "fiery",
  "infernal",
] as const;

export interface KuudraTier {
  tier: string;
  completions: number;
  // The texture is the tier's key.
  texture: ItemTexture;
}

export interface FishingSection {
  trophyFish: TrophyFish[];
  trophyFishCaught: number;
  itemsFished: Record<"total" | Catch, number>;
  seaCreatureKills: number;
  // Sea creatures sort by the most kills first.
  seaCreatures: { name: string; kills: number }[];
}

export interface TrophyFish {
  id: string;
  name: string;
  tiers: Record<TrophyTier, number>;
}

export interface JacobSection {
  // Medals count only the unspent ones.
  medals: Record<JacobMedal, number>;
  contests: number;
  crops: JacobCrop[];
  // These perks are the ones bought from Anita.
  perks: { farmingFortune: number; farmingLevelCap: number };
}

export interface JacobCrop {
  // The id is the API's item id, like INK_SACK:3.
  id: string;
  name: string;
  texture?: ItemTexture;
  // The bracket is the best one reached.
  bracket?: JacobBracket;
  personalBest?: number;
}

export interface GardenSection {
  copper: number;
  // The greenhouse lists the discovered crops, by name.
  greenhouse: GreenhouseCrop[];
  // gardenFetchedAt says whether a null Garden was fetched.
  garden: GardenView | null;
}

interface GreenhouseCrop {
  id: string;
  name: string;
  analyzed: boolean;
}

export interface GardenView {
  level: Level;
  plots: { unlocked: number; total: number };
  // Crops lists every crop with milestones, by name.
  crops: GardenCrop[];
  composter: { id: string; name: string; level: number; maxLevel: number }[];
  visitors: { unique: number; served: number; list: GardenVisitor[] };
  barnSkins: { selected?: string; unlocked: string[] };
  greenhouseSkins: string[];
}

interface GardenCrop {
  // The id is the API's item id, as in JacobCrop.
  id: string;
  name: string;
  texture?: ItemTexture;
  collected: number;
  milestone: Level;
  upgrade: { level: number; maxLevel: number };
}

interface GardenVisitor {
  id: string;
  name: string;
  // A visitor NEU-REPO doesn't list has no rarity.
  rarity?: Rarity;
  visits: number;
  completed: number;
}

export interface ChocolateSection {
  // The level goes up by one for each prestige.
  level: number;
  chocolate: number;
  // The total counts all-time chocolate.
  total: number;
  sincePrestige: number;
  // Prestige VI is the last, so it has no next prestige.
  nextPrestige?: number;
  rabbits: { rarity: Rarity; found: number; total: number }[];
  employees: { employee: string; level: number }[];
  timeTower: number;
}

export interface ExperimentsSection {
  games: { game: Experiment; bonusClicks: number; tiers: ExperimentTier[] }[];
  // Serums counts the ones drunk.
  serums: number;
}

export interface ExperimentTier {
  // The tier is the API's index, which starts at 1 for Ultrasequencer.
  tier: number;
  // Hypixel doesn't keep attempts for every game.
  attempts?: number;
  claims: number;
  bestScore?: number;
}

export interface RiftSection {
  motes: number;
  lifetimeMotes: number;
  visits: number;
  enigmaSouls: number;
  timecharms: number;
  catsFound: number;
}

export const STAT_GROUPS = [
  "combat",
  "mining",
  "farming",
  "foraging",
  "fishing",
  "misc",
  "wisdoms",
] as const;

export type StatGroup = (typeof STAT_GROUPS)[number];

// A list keeps the wiki's order, since swc's jsonify sorts an object's keys.
export const PLAYER_STATS = [
  { id: "health", symbol: "❤", color: "§c", group: "combat" },
  { id: "defense", symbol: "❈", color: "§a", group: "combat" },
  { id: "true_defense", symbol: "❂", color: "§f", group: "combat" },
  { id: "strength", symbol: "❁", color: "§c", group: "combat" },
  {
    id: "crit_damage",
    symbol: "☠",
    color: "§9",
    group: "combat",
    percent: true,
  },
  {
    id: "crit_chance",
    symbol: "☣",
    color: "§9",
    group: "combat",
    percent: true,
  },
  {
    id: "attack_speed",
    symbol: "⚔",
    color: "§e",
    group: "combat",
    percent: true,
    aliases: ["Bonus Attack Speed"],
  },
  { id: "swing_range", symbol: "Ⓢ", color: "§e", group: "combat" },
  { id: "intelligence", symbol: "✎", color: "§b", group: "combat" },
  { id: "ferocity", symbol: "⫽", color: "§c", group: "combat" },
  {
    id: "ability_damage",
    symbol: "๑",
    color: "§c",
    group: "combat",
    percent: true,
  },
  { id: "health_regen", symbol: "❣", color: "§c", group: "combat" },
  { id: "vitality", symbol: "♨", color: "§4", group: "combat" },
  { id: "mending", symbol: "☄", color: "§a", group: "combat" },
  { id: "breaking_power", symbol: "Ⓟ", color: "§2", group: "mining" },
  { id: "mining_speed", symbol: "⸕", color: "§6", group: "mining" },
  { id: "mining_spread", symbol: "▚", color: "§e", group: "mining" },
  { id: "gemstone_spread", symbol: "▚", color: "§e", group: "mining" },
  { id: "pristine", symbol: "✧", color: "§5", group: "mining" },
  { id: "mining_fortune", symbol: "☘", color: "§6", group: "mining" },
  { id: "ore_fortune", symbol: "☘", color: "§6", group: "mining" },
  { id: "block_fortune", symbol: "☘", color: "§6", group: "mining" },
  { id: "dwarven_metal_fortune", symbol: "☘", color: "§6", group: "mining" },
  { id: "gemstone_fortune", symbol: "☘", color: "§6", group: "mining" },
  { id: "heat_resistance", symbol: "♨", color: "§c", group: "mining" },
  { id: "cold_resistance", symbol: "❄", color: "§b", group: "mining" },
  { id: "farming_fortune", symbol: "☘", color: "§6", group: "farming" },
  { id: "wheat_fortune", symbol: "☘", color: "§6", group: "farming" },
  { id: "carrot_fortune", symbol: "☘", color: "§6", group: "farming" },
  { id: "potato_fortune", symbol: "☘", color: "§6", group: "farming" },
  { id: "pumpkin_fortune", symbol: "☘", color: "§6", group: "farming" },
  {
    id: "melon_slice_fortune",
    symbol: "☘",
    color: "§6",
    group: "farming",
    aliases: ["Melon Fortune"],
  },
  { id: "mushroom_fortune", symbol: "☘", color: "§6", group: "farming" },
  { id: "cactus_fortune", symbol: "☘", color: "§6", group: "farming" },
  { id: "sugar_cane_fortune", symbol: "☘", color: "§6", group: "farming" },
  { id: "nether_wart_fortune", symbol: "☘", color: "§6", group: "farming" },
  { id: "cocoa_beans_fortune", symbol: "☘", color: "§6", group: "farming" },
  { id: "sunflower_fortune", symbol: "☘", color: "§6", group: "farming" },
  { id: "moonflower_fortune", symbol: "☘", color: "§6", group: "farming" },
  { id: "wild_rose_fortune", symbol: "☘", color: "§6", group: "farming" },
  {
    id: "bonus_pest_chance",
    symbol: "ൠ",
    color: "§2",
    group: "farming",
    percent: true,
  },
  { id: "overbloom", symbol: "☀", color: "§e", group: "farming" },
  { id: "sweep", symbol: "∮", color: "§2", group: "foraging" },
  { id: "foraging_fortune", symbol: "☘", color: "§6", group: "foraging" },
  { id: "fig_fortune", symbol: "☘", color: "§6", group: "foraging" },
  { id: "mangrove_fortune", symbol: "☘", color: "§6", group: "foraging" },
  { id: "helix_fortune", symbol: "☘", color: "§6", group: "foraging" },
  {
    id: "timber",
    symbol: "",
    color: "§4",
    group: "foraging",
    percent: true,
  },
  {
    id: "sea_creature_chance",
    symbol: "α",
    color: "§3",
    group: "fishing",
    percent: true,
  },
  { id: "fishing_speed", symbol: "☂", color: "§b", group: "fishing" },
  {
    id: "double_hook_chance",
    symbol: "⚓",
    color: "§9",
    group: "fishing",
    percent: true,
  },
  {
    id: "treasure_chance",
    symbol: "⛃",
    color: "§6",
    group: "fishing",
    percent: true,
  },
  {
    id: "trophy_chance",
    symbol: "♔",
    color: "§6",
    group: "fishing",
    percent: true,
    aliases: ["Trophy Fish Chance"],
  },
  { id: "speed", symbol: "✦", color: "§f", group: "misc" },
  { id: "magic_find", symbol: "✯", color: "§b", group: "misc" },
  { id: "pet_luck", symbol: "♣", color: "§d", group: "misc" },
  { id: "tracking", symbol: "❃", color: "§d", group: "misc" },
  { id: "respiration", symbol: "⚶", color: "§3", group: "misc" },
  { id: "pressure_resistance", symbol: "❍", color: "§9", group: "misc" },
  { id: "fear", symbol: "", color: "§5", group: "misc" },
  {
    id: "hunting_fortune",
    symbol: "",
    color: "§d",
    group: "misc",
    aliases: ["Hunter Fortune"],
  },
  { id: "pull", symbol: "", color: "§b", group: "misc" },
  { id: "charm_chance", symbol: "", color: "§d", group: "misc" },
  { id: "combat_wisdom", symbol: "☯", color: "§3", group: "wisdoms" },
  { id: "mining_wisdom", symbol: "☯", color: "§3", group: "wisdoms" },
  { id: "farming_wisdom", symbol: "☯", color: "§3", group: "wisdoms" },
  { id: "foraging_wisdom", symbol: "☯", color: "§3", group: "wisdoms" },
  { id: "fishing_wisdom", symbol: "☯", color: "§3", group: "wisdoms" },
  { id: "enchanting_wisdom", symbol: "☯", color: "§3", group: "wisdoms" },
  { id: "alchemy_wisdom", symbol: "☯", color: "§3", group: "wisdoms" },
  { id: "carpentry_wisdom", symbol: "☯", color: "§3", group: "wisdoms" },
  { id: "runecrafting_wisdom", symbol: "☯", color: "§3", group: "wisdoms" },
  { id: "social_wisdom", symbol: "☯", color: "§3", group: "wisdoms" },
  { id: "taming_wisdom", symbol: "☯", color: "§3", group: "wisdoms" },
  { id: "hunting_wisdom", symbol: "☯", color: "§3", group: "wisdoms" },
] as const;

export type PlayerStat = (typeof PLAYER_STATS)[number]["id"];

export type Stats = Partial<Record<PlayerStat, number>>;

export interface StatValue {
  stat: PlayerStat;
  value: number;
}

export interface StatTotal {
  stat: PlayerStat;
  total: number;
  bySource: Partial<Record<StatSource, number>>;
}

export interface StatsSection {
  // Stats follow PLAYER_STATS' order.
  stats: StatTotal[];
  weapon?: string;
  unverified: StatSource[];
}

export interface MiscSection {
  kills: number;
  deaths: number;
  // Top kills are the 20 most, by mob id.
  topKills: { id: string; count: number }[];
  // Top deaths are by cause.
  topDeaths: { id: string; count: number }[];
  highestDamage?: number;
  highestCriticalDamage?: number;
  auctions: Record<AuctionStat, number>;
  gifts: { given: number; received: number };
  // Chains are completed burrow chains.
  mythological: { kills: number; chains: number };
  candy: number;
  soulflow: number;
}

export interface PetsSection {
  score: number;
  active?: PetView;
  pets: PetView[];
  totalXp: number;
  skinned: number;
  candyUsed: number;
}

export interface PetView {
  uuid?: string;
  type: string;
  name: string;
  rarity: Rarity;
  level: Level;
  heldItem?: string;
  heldItemTexture?: ItemTexture;
  skin?: string;
  candyUsed: number;
  active: boolean;
  texture: ItemTexture;
}

// coins is per unit, and a bazaar entry's coins is its sell price.
export type PriceEntry =
  | { coins: number; source: "bin"; listings: number }
  | { coins: number; source: "bazaar"; buy: number }
  | { coins: number; source: "npc" };

export interface PriceMap {
  asOf: number;
  entries: Record<string, PriceEntry>;
}

export interface BazaarProduct {
  id: string;
  instantBuy?: number;
  instantSell?: number;
  buyPrice: number;
  sellPrice: number;
  buyMovingWeek: number;
  sellMovingWeek: number;
}

export interface Bazaar {
  lastUpdated: number;
  products: Record<string, BazaarProduct>;
}

export interface ItemCost {
  coins: number;
  source: "bin" | "bazaar";
}

export interface MissingAccessory {
  id: string;
  name: string;
  rarity: Rarity;
  // The power counts only what it adds over the tier in the bag it replaces.
  accessoryPower: number;
  // Outside the bag means the inventory, ender chest, a backpack or the vault.
  outsideBag: boolean;
  // An accessory outside the bag has no cost.
  cost?: ItemCost;
  coinsPerAccessoryPower?: number;
  replaces?: string;
  texture: ItemTexture;
}

export interface AccessoriesSection {
  accessoryPower: number;
  highestAccessoryPower?: number;
  selectedPower?: string;
  // Only a Power learned from a stone has these.
  powerStats?: PowerStat[];
  tuning: Record<string, number>;
  tuningPoints: number;
  enrichments: number;
  // Only Legendary and higher accessories can take an enrichment.
  unenriched: number;
  recombobulated: number;
  pricesAsOf: number;
  market: boolean;
  active: ItemView[];
  inactive: InactiveAccessory[];
  // Missing ones outside the bag come first, then the cheapest per power.
  missing: MissingAccessory[];
}

export interface PowerStat {
  name: string;
  color: string;
  value: number;
}

export type InactiveAccessory = ItemView &
  (
    | { reason: "duplicate" }
    | { reason: "replaced"; replacedBy: { id: string; name: string } }
  );

export interface NetworthSection {
  total: number;
  unsoulbound: number;
  purse: number;
  bank: number;
  personalBank: number;
  coins: number;
  nonCosmetic: { total: number; unsoulbound: number };
  noInventory: boolean;
  museumIncluded: boolean;
  pricesAsOf: number;
  categories: Record<
    string,
    { total: number; unsoulbound: number; top: NetworthItem[] }
  >;
  // Pet prices are keyed by pet uuid.
  petPrices: Record<string, number>;
  unpriced: { key: string; name: string; count: number }[];
  unpricedCount: number;
}

export interface NetworthItem {
  id: string;
  name: string;
  count: number;
  price: number;
  soulbound: boolean;
  cosmetic: boolean;
  texture?: ItemTexture;
  // The base price is the whole stack's, before modifiers.
  basePrice: number;
  // Modifiers are one per kind, priciest first.
  modifiers: { type: string; price: number }[];
}

export interface SkyBlockLevelSection {
  level: Level;
  pricesAsOf: number;
  market: boolean;
  sources: {
    kind: "accessory" | "pet";
    // A pet's id is its price key, or its type when it has no market.
    id: string;
    name: string;
    xp: number;
    outsideBag: boolean;
    cost?: ItemCost;
    coinsPerXp?: number;
    texture: ItemTexture;
  }[];
}

// No uuid: its random bytes were a fifth of a gzipped inventories payload.
export interface ItemView {
  // A vanilla item's id is "minecraft:<id>:<damage>".
  id: string;
  name: string;
  // Lore keeps its § codes, normalized as 1.8 draws them.
  lore: string[];
  rarity?: Rarity;
  count: number;
  glint: boolean;
  texture: ItemTexture;
  reforge?: string;
  stars?: number;
  recombobulated: boolean;
  enchantments?: Record<string, number>;
  // An accessory's enrichment is its stat id.
  enrichment?: string;
  hotPotato?: number;
  obtainedAt?: number;
}

// An item's id is its 1.8 numeric id, and a head's skin is a texture hash.
export type ItemTexture =
  | { kind: "item"; id: number; damage: number; color?: number }
  | { kind: "head"; skin: string };

// The API keeps this to itself and never sends it to clients.
export interface ItemsResource {
  lastUpdated: number;
  // The museum maps each item or armor set to its category.
  museum: Record<string, string>;
  items: Record<
    string,
    {
      name: string;
      tier?: Rarity;
      material: string;
      durability?: number;
      skin?: string;
      color?: string;
      category?: string;
      riftOnly?: boolean;
      npcPrice?: number;
      glowing?: boolean;
    }
  >;
}

// texture is missing for a material the 1.8 table doesn't map yet.
export interface PriceView {
  id: string;
  name: string;
  rarity?: Rarity;
  texture?: ItemTexture;
  // The price map's, which networth counts.
  current?: { coins: number; source: PriceEntry["source"] };
  bazaar?: BazaarProduct;
  lowestBin?: { coins: number; listings: number };
  npc?: number;
  asOf: number;
}

// The id of a search result is a price key, so books and pets have their own.
export interface ItemMatch {
  id: string;
  name: string;
  rarity?: Rarity;
  texture?: ItemTexture;
}
