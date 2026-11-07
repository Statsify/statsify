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
  gardenFetchedAt?: number;
  marketDown?: Exclude<keyof MemberView, "apiSettings">[]; // asked for, but left out until the price map and items resource are built
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
  garden?: GardenSection;
  chocolate?: ChocolateSection | null;
  hotf?: HotfSection | null;
  gear?: GearSection | null;
  inventories?: InventoriesSection | null;
  museum?: MuseumView | null; // null: nothing to show (the profile's museumFetchedAt says whether it was fetched)
  experiments?: ExperimentsSection | null;
  rift?: RiftSection | null;
  misc?: MiscSection;
}

/** An inventory's slots in the game's order; an empty slot is null. */
export type Slots = (ItemView | null)[];

/** Worn and saved gear. null with the inventory API off. */
export interface GearSection {
  armor: Slots; // helmet to boots
  equipment: Slots; // necklace, cloak, belt, gloves
  wardrobe: { slot: number; armor: Slots }[]; // sets with anything in them, helmet to boots
  wardrobeSlot?: number; // the set being worn
  weapons: ItemView[]; // swords, bows and wands in the inventory, in its order
}

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

/** Every inventory as pages of slots (the ender chest's pages, one per backpack), and the sacks. null with the inventory API off. */
export interface InventoriesSection {
  pages: Partial<Record<InventoryId, Slots[]>>; // personalVault is missing with its own setting off
  backpackIcons: (ItemView | null)[]; // by backpack, as `pages.backpacks`
  sacks: { id: string; name: string; count: number; rarity?: Rarity; glint: boolean; texture?: ItemTexture }[]; // largest first
}

export interface MuseumView {
  value: number;
  appraisal: boolean;
  items: { id: string; category?: string; donatedAt?: number; items: Slots }[]; // id: the museum's key (an item, or an armor set)
  special: { donatedAt?: number; items: Slots }[];
  donated: { category: string; count: number }[]; // keys donated per museum_data category, most first
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
  mobsKilled: number;
  mostMobsKilled?: number; // in one run
  mostHealing?: number; // in one run
  milestoneCompletions: number;
}

export const DUNGEON_CLASSES = ["healer", "mage", "berserk", "archer", "tank"] as const;

export type DungeonClass = (typeof DUNGEON_CLASSES)[number];

export interface DungeonsSection {
  catacombs: Level;
  classes: Record<DungeonClass, Level>;
  classAverage: number;
  classXp: number; // the five classes' XP summed
  selectedClass?: string;
  secrets: number;
  secretsPerRun: number; // over every completion in both modes
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
  powder: Record<Powder, { total: number; spent: number; available?: number }>; // total: all earned; available: unknown on older saves
  nodes: TreeNode[];
  crystals: { found: number; placed: number; gems: Crystal[] }; // found and placed over every gem, then each gem found
  nucleusRuns: number;
  kingQuests: number; // the Goblin King's, in the Crystal Hollows
  glacite: {
    corpses: number; // looted, of every type
    corpsesByType: { type: string; count: number }[];
    fossils: number; // donated
    fossilDust: number;
    mineshafts: number;
  };
}

/** A gem's crystal the member has found. Only the Crystal Nucleus's five count placed ones. */
export interface Crystal {
  gem: string;
  found: number;
  placed?: number;
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

export const CATCHES = ["normal", "treasure", "largeTreasure", "outstanding"] as const;

export type Catch = (typeof CATCHES)[number];

export interface FishingSection {
  trophyFish: TrophyFish[];
  trophyFishCaught: number;
  itemsFished: Record<"total" | Catch, number>;
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

/** The member's copper and greenhouse crops, which need no Garden call, and the profile's Garden. */
export interface GardenSection {
  copper: number;
  greenhouse: GreenhouseCrop[]; // the discovered ones, by name
  garden: GardenView | null; // null: nothing to show (the profile's gardenFetchedAt says whether it was fetched)
}

export interface GreenhouseCrop {
  id: string;
  name: string;
  analyzed: boolean;
}

/** Shared by the profile's members. */
export interface GardenView {
  level: Level;
  plots: { unlocked: number; total: number };
  crops: GardenCrop[]; // every crop with milestones, by name
  composter: { id: string; name: string; level: number; maxLevel: number }[];
  visitors: { unique: number; served: number; list: GardenVisitor[] };
  barnSkins: { selected?: string; unlocked: string[] }; // names; unlocked: the ones from items
  greenhouseSkins: string[]; // names
}

export interface GardenCrop {
  id: string; // the item id the API uses, as JacobCrop's
  name: string;
  texture?: ItemTexture;
  collected: number;
  milestone: Level;
  upgrade: { level: number; maxLevel: number };
}

export interface GardenVisitor {
  id: string;
  name: string;
  rarity?: Rarity; // missing for a visitor NEU-REPO doesn't list
  visits: number;
  completed: number;
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

// The API's names for Superpairs, Chronomatron and Ultrasequencer
export const EXPERIMENTS = ["pairings", "simon", "numbers"] as const;

export type Experiment = (typeof EXPERIMENTS)[number];

export interface ExperimentsSection {
  games: { game: Experiment; bonusClicks: number; tiers: ExperimentTier[] }[];
  serums: number; // drunk
}

export interface ExperimentTier {
  tier: number; // the API's index, which each game numbers its own way (Ultrasequencer's start at 1)
  attempts?: number; // not kept for every game
  claims: number;
  bestScore?: number;
}

export interface RiftSection {
  motes: number;
  lifetimeMotes: number;
  visits: number;
  enigmaSouls: number; // found
  timecharms: number; // secured
  catsFound: number;
}

export const STAT_GROUPS = ["combat", "mining", "farming", "foraging", "fishing", "misc", "wisdoms"] as const;

export type StatGroup = (typeof STAT_GROUPS)[number];

/**
 * Player stats in the wiki's order, with 1.8 lore's symbols and colours; lore names a stat as `prettify(id)`, or by an
 * older name in `aliases`. Rift-only stats aren't here. A list and not a record keyed by id: swc's jsonify step sorts a
 * large object literal's keys.
 */
export const PLAYER_STATS = [
  { id: "health", symbol: "❤", color: "§c", group: "combat" },
  { id: "defense", symbol: "❈", color: "§a", group: "combat" },
  { id: "true_defense", symbol: "❂", color: "§f", group: "combat" },
  { id: "strength", symbol: "❁", color: "§c", group: "combat" },
  { id: "crit_damage", symbol: "☠", color: "§9", group: "combat", percent: true },
  { id: "crit_chance", symbol: "☣", color: "§9", group: "combat", percent: true },
  { id: "attack_speed", symbol: "⚔", color: "§e", group: "combat", percent: true, aliases: ["Bonus Attack Speed"] },
  { id: "swing_range", symbol: "Ⓢ", color: "§e", group: "combat" },
  { id: "intelligence", symbol: "✎", color: "§b", group: "combat" },
  { id: "ferocity", symbol: "⫽", color: "§c", group: "combat" },
  { id: "ability_damage", symbol: "๑", color: "§c", group: "combat", percent: true },
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
  { id: "melon_slice_fortune", symbol: "☘", color: "§6", group: "farming", aliases: ["Melon Fortune"] },
  { id: "mushroom_fortune", symbol: "☘", color: "§6", group: "farming" },
  { id: "cactus_fortune", symbol: "☘", color: "§6", group: "farming" },
  { id: "sugar_cane_fortune", symbol: "☘", color: "§6", group: "farming" },
  { id: "nether_wart_fortune", symbol: "☘", color: "§6", group: "farming" },
  { id: "cocoa_beans_fortune", symbol: "☘", color: "§6", group: "farming" },
  { id: "sunflower_fortune", symbol: "☘", color: "§6", group: "farming" },
  { id: "moonflower_fortune", symbol: "☘", color: "§6", group: "farming" },
  { id: "wild_rose_fortune", symbol: "☘", color: "§6", group: "farming" },
  { id: "bonus_pest_chance", symbol: "ൠ", color: "§2", group: "farming", percent: true },
  { id: "overbloom", symbol: "☀", color: "§e", group: "farming" },
  { id: "sweep", symbol: "∮", color: "§2", group: "foraging" },
  { id: "foraging_fortune", symbol: "☘", color: "§6", group: "foraging" },
  { id: "fig_fortune", symbol: "☘", color: "§6", group: "foraging" },
  { id: "mangrove_fortune", symbol: "☘", color: "§6", group: "foraging" },
  { id: "helix_fortune", symbol: "☘", color: "§6", group: "foraging" },
  { id: "timber", symbol: "", color: "§4", group: "foraging", percent: true },
  { id: "sea_creature_chance", symbol: "α", color: "§3", group: "fishing", percent: true },
  { id: "fishing_speed", symbol: "☂", color: "§b", group: "fishing" },
  { id: "double_hook_chance", symbol: "⚓", color: "§9", group: "fishing", percent: true },
  { id: "treasure_chance", symbol: "⛃", color: "§6", group: "fishing", percent: true },
  { id: "trophy_chance", symbol: "♔", color: "§6", group: "fishing", percent: true, aliases: ["Trophy Fish Chance"] },
  { id: "speed", symbol: "✦", color: "§f", group: "misc" },
  { id: "magic_find", symbol: "✯", color: "§b", group: "misc" },
  { id: "pet_luck", symbol: "♣", color: "§d", group: "misc" },
  { id: "tracking", symbol: "❃", color: "§d", group: "misc" },
  { id: "respiration", symbol: "⚶", color: "§3", group: "misc" },
  { id: "pressure_resistance", symbol: "❍", color: "§9", group: "misc" },
  { id: "fear", symbol: "", color: "§5", group: "misc" },
  { id: "hunting_fortune", symbol: "", color: "§d", group: "misc", aliases: ["Hunter Fortune"] },
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
] as const satisfies readonly {
  id: string;
  symbol: string;
  color: string;
  group: StatGroup;
  percent?: true;
  aliases?: readonly string[];
}[];

export type PlayerStat = (typeof PLAYER_STATS)[number]["id"];

export interface StatValue {
  stat: PlayerStat;
  value: number;
}

export const AUCTION_STATS = ["created", "completed", "won", "bids", "highestBid", "goldSpent", "goldEarned", "fees"] as const;

export type AuctionStat = (typeof AUCTION_STATS)[number];

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
  candy: number; // collected at Spooky Festivals
  soulflow: number;
}

export interface PetsSection {
  score: number;
  active?: PetView;
  pets: PetView[];
  totalXp: number; // every pet's XP ever gained
  skinned: number;
  candyUsed: number; // over every pet
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
  unenriched: number; // active Legendary-and-up accessories without an enrichment, the ones that can take one
  recombobulated: number; // active
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
  petPrices: Record<string, number>; // by the pet's uuid, for every pet the pets category priced
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
  basePrice: number; // the item's (or the whole stack's) before what's applied to it
  modifiers: { type: string; price: number }[]; // a single item's, summed per kind (ENCHANTMENT, REFORGE…), priciest first; pet candy is negative
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

// No item uuid: nothing reads it, and its random bytes were a fifth of a full inventories payload gzipped
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
  hotPotato?: number; // hot potato books applied
  obtainedAt?: number; // ms
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
  museum: Record<string, string>; // a museum key (an item, or an armor set) → its museum category
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

/** texture is missing for a material the 1.8 table doesn't map yet. */
export interface PriceView {
  id: string;
  name: string;
  rarity?: Rarity;
  texture?: ItemTexture;
  current?: { coins: number; source: PriceEntry["source"] }; // the price map's, which networth counts
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
  texture?: ItemTexture;
}
