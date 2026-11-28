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
import type { SkinArmor } from "./sections/gear.js";

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
  stale: boolean; // older than 5 min, served because a refetch failed
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
  levelColor: string; // a § code
  xp: number;
  newProfile: boolean; // so missing data is empty, not hidden by an API setting
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
  // Sections asked for but left out until the price map and items are built.
  marketDown?: Exclude<keyof MemberView, "apiSettings">[];
}

// A null section is one the player's API settings hide.
export interface MemberView {
  apiSettings: ApiSettings;
  accessories?: AccessoriesSection | null;
  armor?: SkinArmor | null;
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
  chocolate?: ChocolateSection | null;
  hotf?: HotfSection | null;
  gear?: GearSection | null;
  inventories?: InventoriesSection | null;
  museum?: MuseumView | null; // null with no museum fetched or nothing donated
  experiments?: ExperimentsSection | null;
  rift?: RiftSection | null;
  misc?: MiscSection;
}

// An inventory's slots, in the game's order.
export type Slots = (ItemView | null)[];

export interface GearSection {
  armor: Slots; // helmet to boots
  equipment: Slots; // necklace, cloak, belt, gloves
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
  backpackIcons: (ItemView | null)[]; // in the order of pages.backpacks
  sacks: {
    id: string;
    name: string;
    count: number;
    rarity?: Rarity;
    glint: boolean;
    texture?: ItemTexture;
  }[]; // largest first
}

export interface MuseumView {
  value: number;
  appraisal: boolean;
  // An id is an item or an armor set.
  items: { id: string; category?: string; donatedAt?: number; items: Slots }[];
  special: { donatedAt?: number; items: Slots }[];
  donated: { category: string; count: number }[]; // most first
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
  xpCurrent: number; // at the max level, all the XP past it
  xpForNext?: number;
  progress: number;
}

export interface SkillLevel extends Level {
  unverified: boolean; // the API can't confirm the cap (Foraging past 53)
}

export interface SkillsSection {
  average: number;
  skills: Record<Skill, SkillLevel>;
}

export interface SlayersSection {
  xp: number;
  bosses: Record<SlayerBoss, { level: Level; kills: number[] }>; // kills[tier - 1]
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
  mostMobsKilled?: number; // in one run
  mostHealing?: number; // in one run
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
  amount?: number; // missing for a shop Hypixel sends no balance for
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
  texture: ItemTexture; // its key's
}

export interface FishingSection {
  trophyFish: TrophyFish[];
  trophyFishCaught: number;
  itemsFished: Record<"total" | Catch, number>;
  seaCreatureKills: number;
  seaCreatures: { name: string; kills: number }[]; // the most killed first
}

export interface TrophyFish {
  id: string;
  name: string;
  tiers: Record<TrophyTier, number>;
}

export interface JacobSection {
  medals: Record<JacobMedal, number>; // unspent
  contests: number;
  crops: JacobCrop[];
  perks: { farmingFortune: number; farmingLevelCap: number }; // Anita's
}

export interface JacobCrop {
  id: string; // the API's item id, like INK_SACK:3
  name: string;
  texture?: ItemTexture;
  bracket?: JacobBracket; // the best one reached
  personalBest?: number;
}

export interface ChocolateSection {
  level: number; // one more for each prestige
  chocolate: number;
  total: number; // all-time
  sincePrestige: number;
  nextPrestige?: number; // none after prestige VI, the last
  rabbits: { rarity: Rarity; found: number; total: number }[];
  employees: { employee: string; level: number }[];
  timeTower: number;
}

export interface ExperimentsSection {
  games: { game: Experiment; bonusClicks: number; tiers: ExperimentTier[] }[];
  serums: number; // drunk
}

export interface ExperimentTier {
  tier: number; // the API's index, which starts at 1 for Ultrasequencer
  attempts?: number; // not kept for every game
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
  topKills: { id: string; count: number }[]; // the 20 most, by mob id
  topDeaths: { id: string; count: number }[]; // by cause
  highestDamage?: number;
  highestCriticalDamage?: number;
  auctions: Record<AuctionStat, number>;
  gifts: { given: number; received: number };
  mythological: { kills: number; chains: number }; // burrow chains completed
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
  accessoryPower: number; // over the tier in the bag it replaces
  outsideBag: boolean; // in the inventory, ender chest, a backpack or the vault
  cost?: ItemCost; // none for one outside the bag
  coinsPerAccessoryPower?: number;
  replaces?: string;
  texture: ItemTexture;
}

export interface AccessoriesSection {
  accessoryPower: number;
  highestAccessoryPower?: number;
  selectedPower?: string;
  powerStats?: PowerStat[]; // only for a Power learned from a stone
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
  missing: MissingAccessory[]; // outside the bag first, then the cheapest per AP
}

export interface PowerStat {
  name: string;
  color: string; // a § code
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
  petPrices: Record<string, number>; // by pet uuid
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
  basePrice: number; // the whole stack's, before modifiers
  modifiers: { type: string; price: number }[]; // per kind, priciest first
}

export interface SkyBlockLevelSection {
  level: Level;
  pricesAsOf: number;
  market: boolean;
  sources: {
    kind: "accessory" | "pet";
    id: string; // an accessory id, a pet price key, or a pet type without a market
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
  id: string; // vanilla items: "minecraft:<id>:<damage>"
  name: string;
  lore: string[]; // § codes kept, as 1.8 draws them (normalizeItemText)
  rarity?: Rarity;
  count: number;
  glint: boolean;
  texture: ItemTexture;
  reforge?: string;
  stars?: number;
  recombobulated: boolean;
  enchantments?: Record<string, number>;
  enrichment?: string; // an accessory's, as its stat id
  hotPotato?: number;
  obtainedAt?: number; // ms
}

export type ItemTexture =
  | { kind: "item"; id: number; damage: number; color?: number } // 1.8 numeric id
  | { kind: "head"; skin: string }; // skin texture hash

// The API keeps this to itself and never sends it to clients.
export interface ItemsResource {
  lastUpdated: number;
  museum: Record<string, string>; // item or armor set → category
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
