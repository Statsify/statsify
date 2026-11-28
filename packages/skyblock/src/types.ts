/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import type { DungeonClass } from "./sections/dungeons.js";
import type { Powder } from "./sections/hotm.js";
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
}

export interface DungeonsSection {
  catacombs: Level;
  classes: Record<DungeonClass, Level>;
  classAverage: number;
  selectedClass?: string;
  secrets: number;
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
  powder: Record<Powder, { total: number; spent: number }>;
  nodes: {
    id: string;
    name: string;
    level: number;
    maxLevel: number;
    x: number;
    y: number;
    enabled: boolean;
  }[];
  crystals: { found: number; placed: number };
  nucleusRuns: number;
  glacite: { corpses: number; fossils: number; mineshafts: number };
}

export interface PetsSection {
  score: number;
  active?: PetView;
  pets: PetView[];
  totalXp: number;
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

export interface ItemView {
  id: string; // vanilla items: "minecraft:<id>:<damage>"
  uuid?: string;
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
}

export type ItemTexture =
  | { kind: "item"; id: number; damage: number; color?: number } // 1.8 numeric id
  | { kind: "head"; skin: string }; // skin texture hash

// The API keeps this to itself and never sends it to clients.
export interface ItemsResource {
  lastUpdated: number;
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
    }
  >;
}

// texture is missing for a material the 1.8 table doesn't map yet.
export interface PriceView {
  id: string;
  name: string;
  rarity?: Rarity;
  texture?: ItemTexture;
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
}
