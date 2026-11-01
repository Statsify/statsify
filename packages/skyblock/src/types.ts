/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

// On a section, `undefined` means it wasn't requested and `null` means the player's API setting hides it.

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
  levelColor: string; // the § code of the level's bracket
  xp: number;
  newProfile: boolean; // brand new, so missing data is empty rather than hidden by an API setting
  purse: number;
  bank?: number;
  personalBank?: number;
  firstJoin?: number;
  fairySouls: number;
}

export interface SkyBlockProfileView extends PlayerRef, Freshness, ProfileSummary {
  member: MemberView;
  museumFetchedAt?: number;
}

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
  xpCurrent: number;
  xpForNext?: number;
  progress: number;
}

export interface SkillLevel extends Level {
  unverified: boolean; // the level rests on a cap the API can't confirm (foraging past 53)
}

export const SKILLS = [
  "farming",
  "mining",
  "combat",
  "foraging",
  "fishing",
  "enchanting",
  "alchemy",
  "taming",
  "carpentry",
  "hunting",
  "runecrafting",
  "social",
] as const;

export type Skill = (typeof SKILLS)[number];

export interface SkillsSection {
  average: number;
  skills: Record<Skill, SkillLevel>;
}

export const SLAYER_BOSSES = ["zombie", "spider", "wolf", "enderman", "blaze", "vampire"] as const;

export type SlayerBoss = (typeof SLAYER_BOSSES)[number];

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

export const DUNGEON_CLASSES = ["healer", "mage", "berserk", "archer", "tank"] as const;

export type DungeonClass = (typeof DUNGEON_CLASSES)[number];

export interface DungeonsSection {
  catacombs: Level;
  classes: Record<DungeonClass, Level>;
  classAverage: number;
  selectedClass?: string;
  secrets: number;
  floors: Record<"normal" | "master", DungeonFloor[]>;
  highestFloor: Partial<Record<"normal" | "master", number>>;
  mostDamage: Record<"normal" | "master", Record<DungeonClass, number>>; // 0 for a class never played
  watcherKills: number;
  essence: Essence[];
}

export interface Essence {
  type: string; // WITHER, CRIMSON…
  amount?: number; // missing for a type Hypixel doesn't send, like Forest and Fossil
  perks: number; // shop perk levels bought
  maxPerks: number;
}

export const POWDERS = ["mithril", "gemstone", "glacite"] as const;

export type Powder = (typeof POWDERS)[number];

export interface HotmSection {
  level: Level;
  loadout: { selected: number; total: number };
  tokens: { spent: number; total: number };
  ability?: string;
  powder: Record<Powder, { available: number; spent: number }>;
  nodes: { id: string; name: string; level: number; maxLevel: number; x: number; y: number; enabled: boolean }[];
}

export interface PetsSection {
  score: number;
  active?: PetView;
  pets: PetView[];
}

export interface PetView {
  uuid?: string;
  type: string;
  name: string;
  rarity: Rarity;
  level: Level;
  heldItem?: string;
  skin?: string;
  candyUsed: number;
  active: boolean;
  texture: ItemTexture;
}

/** One price per unit; listings is the BIN count behind it. */
export type PriceEntry =
  | { coins: number; source: "bin"; listings: number }
  | { coins: number; source: "bazaar"; buy: number } // coins is the sell price, buy what buying one costs
  | { coins: number; source: "npc" };

export interface PriceMap {
  asOf: number;
  auctionsUpdated: number;
  bazaarUpdated: number;
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
  outsideBag: boolean;
  cost?: ItemCost;
  coinsPerAccessoryPower?: number;
  replaces?: string;
  texture: ItemTexture;
}

export interface AccessoriesSection {
  accessoryPower: number;
  highestAccessoryPower?: number;
  selectedPower?: string;
  tuning: Record<string, number>;
  pricesAsOf: number;
  market: boolean;
  active: ItemView[];
  inactive: ItemView[]; // duplicates and tiers an upgrade in the bag replaces
  missing: MissingAccessory[];
}

export interface NetworthSection {
  total: number;
  unsoulbound: number;
  purse: number;
  bank: number;
  personalBank: number;
  coins: number;
  nonCosmetic: { total: number; unsoulbound: number }; // cosmetic items and modifiers left out
  noInventory: boolean;
  museumIncluded: boolean;
  pricesAsOf: number;
  categories: Record<string, { total: number; unsoulbound: number; top: NetworthItem[] }>;
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
}

export type ItemTexture =
  | { kind: "item"; id: number; damage: number; color?: number } // 1.8 numeric id
  | { kind: "head"; skin: string }; // skin texture hash

/** prismarine-nbt `simplify()` of one slot. */
export interface RawItem {
  id: number;
  Count: number;
  Damage: number;
  tag?: {
    display?: { Name?: string; Lore?: string[]; color?: number };
    ExtraAttributes?: {
      id?: string;
      uuid?: string;
      modifier?: string;
      upgrade_level?: number;
      dungeon_item_level?: number;
      rarity_upgrades?: number;
      enchantments?: Record<string, number>;
      [key: string]: unknown;
    };
    SkullOwner?: { Properties?: { textures?: { Value: string }[] } };
    ench?: unknown[];
  };
}

export interface ItemsResource {
  // API-internal, never sent to clients
  lastUpdated: number;
  raw: object[]; // as Hypixel sent it, for the networth library
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

/** texture is missing for a material the 1.8 table doesn't map yet. */
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

/** An item search result: an items-resource id, an enchanted book or a pet price key. */
export interface ItemMatch {
  id: string;
  name: string;
  rarity?: Rarity;
}
