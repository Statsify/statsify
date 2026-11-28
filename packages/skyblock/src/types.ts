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
  { name: string; x: number; y: number; maxLevel: number }
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
  greenhouse: GreenhouseCrop[]; // the discovered ones, by name
  garden: GardenView | null; // gardenFetchedAt says whether it was fetched
}

interface GreenhouseCrop {
  id: string;
  name: string;
  analyzed: boolean;
}

export interface GardenView {
  level: Level;
  plots: { unlocked: number; total: number };
  crops: GardenCrop[]; // every crop with milestones, by name
  composter: { id: string; name: string; level: number; maxLevel: number }[];
  visitors: { unique: number; served: number; list: GardenVisitor[] };
  barnSkins: { selected?: string; unlocked: string[] };
  greenhouseSkins: string[];
}

interface GardenCrop {
  id: string; // the API's item id, as in JacobCrop
  name: string;
  texture?: ItemTexture;
  collected: number;
  milestone: Level;
  upgrade: { level: number; maxLevel: number };
}

interface GardenVisitor {
  id: string;
  name: string;
  rarity?: Rarity; // missing for a visitor NEU-REPO doesn't list
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
