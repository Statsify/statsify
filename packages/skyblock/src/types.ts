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
  crimson?: CrimsonSection | null;
  fishing?: FishingSection | null;
  jacob?: JacobSection | null;
  chocolate?: ChocolateSection | null;
  hotf?: HotfSection | null;
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
  xpCurrent: number; // into the next level; at the max, everything past it
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
  coreLevel: number; // Core of the Mountain's
  loadout: { selected: number; total: number };
  tokens: { spent: number; total: number };
  ability?: string;
  powder: Record<Powder, { available: number; spent: number }>;
  nodes: TreeNode[];
  crystals: { found: number; placed: number }; // over every gem
  nucleusRuns: number;
  glacite: { corpses: number; fossils: number; mineshafts: number }; // corpses looted, fossils donated
}

/** A perk in the Heart of the Mountain's or the Forest's tree, at its spot in the menu. */
export interface TreeNode {
  id: string;
  name: string;
  level: number;
  maxLevel: number;
  x: number;
  y: number;
  enabled: boolean;
}

export type TreeLayout = Record<string, { name: string; x: number; y: number; maxLevel: number }>;

export const WHISPERS = ["forest", "desert"] as const;

export type Whisper = (typeof WHISPERS)[number];

export interface HotfSection {
  level: Level;
  centerLevel: number; // Center of the Forest's
  loadout: { selected: number; total: number };
  tokensSpent: number;
  ability?: string;
  whispers: Record<Whisper, { total: number; spent: number }>; // total earned; spent by this loadout
  nodes: TreeNode[];
}

export interface CrimsonSection {
  faction?: Faction;
  reputation: Record<Faction, number>;
  kuudra: KuudraTier[];
  dojo: { test: string; points: number }[]; // each test's best
  dojoPoints: number;
  minibosses: { boss: string; kills: number }[];
}

export type Faction = "mages" | "barbarians";

// The API's names: "none" is the basic tier
export const KUUDRA_TIERS = ["none", "hot", "burning", "fiery", "infernal"] as const;

export interface KuudraTier {
  tier: string;
  completions: number;
  texture: ItemTexture; // its key
}

export interface FishingSection {
  trophyFish: TrophyFish[];
  trophyFishCaught: number;
  itemsFished: Record<"total" | "normal" | "treasure" | "largeTreasure" | "outstanding", number>;
  seaCreatureKills: number;
  seaCreatures: { name: string; kills: number }[]; // bestiary kills, the most killed first, none at 0
}

export const TROPHY_TIERS = ["bronze", "silver", "gold", "diamond"] as const;

export type TrophyTier = (typeof TROPHY_TIERS)[number];

export interface TrophyFish {
  id: string;
  name: string;
  tiers: Record<TrophyTier, number>;
}

export const JACOB_BRACKETS = ["bronze", "silver", "gold", "platinum", "diamond"] as const;

export type JacobBracket = (typeof JACOB_BRACKETS)[number];

export const JACOB_MEDALS = ["gold", "silver", "bronze"] as const;

export type JacobMedal = (typeof JACOB_MEDALS)[number];

export interface JacobSection {
  medals: Record<JacobMedal, number>; // unspent
  contests: number; // entered
  crops: JacobCrop[];
  perks: { doubleDrops: number; farmingLevelCap: number };
}

export interface JacobCrop {
  id: string; // the item id the API uses: WHEAT, INK_SACK:3…
  name: string;
  texture?: ItemTexture;
  bracket?: JacobBracket; // the best one reached
  personalBest?: number;
}

export interface ChocolateSection {
  level: number; // the factory's, raised by prestige
  chocolate: number;
  total: number; // all-time
  sincePrestige: number;
  nextPrestige?: number; // the chocolate since the last prestige the next needs; none after VI, the last
  rabbits: { rarity: Rarity; found: number; total: number }[];
  employees: { employee: string; level: number }[];
  timeTower: number;
}

export interface PetsSection {
  score: number;
  active?: PetView;
  pets: PetView[];
  totalXp: number; // every pet's XP ever gained
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
  powerStats?: PowerStat[]; // at this Accessory Power, plus the stone's Unique Power Bonus; only for stone Powers
  tuning: Record<string, number>;
  tuningPoints: number; // spent
  enrichments: number; // on active accessories
  pricesAsOf: number;
  market: boolean;
  active: ItemView[];
  inactive: InactiveAccessory[];
  missing: MissingAccessory[];
}

export interface PowerStat {
  name: string; // Strength, Crit Damage…
  color: string; // its § code
  value: number;
}

/** A duplicate, or a lower tier or variant that another accessory in the bag replaces. */
export type InactiveAccessory = ItemView &
  ({ reason: "duplicate" } | { reason: "replaced"; replacedBy: { id: string; name: string } });

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
  enrichment?: string; // an accessory's, as its stat id
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
      talisman_enrichment?: string;
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
