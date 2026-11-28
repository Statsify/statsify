/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import type { AuctionStat, JerryStat } from "./sections/misc.js";
import type {
  Catch,
  TrophyHunterRank,
  TrophyTier,
} from "./sections/fishing.js";
import type {
  DojoBelt,
  DojoGrade,
  Faction,
  ReputationRank,
} from "./sections/crimson.js";
import type { DungeonClass } from "./sections/dungeons.js";
import type { Experiment } from "./sections/experiments.js";
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
  stale: boolean; // older than 5 min, served because a refetch failed
}

export interface PlayerRef {
  uuid: string;
  username: string;
  displayName: string;
}

// The stored player's PlayerSkyBlock, where Mongo leaves out a 0.
export interface StoredPlayerSkyBlock {
  angler?: number;
  augmentation?: number;
  combat?: number;
  concoctor?: number;
  domesticator?: number;
  excavator?: number;
  gatherer?: number;
  harvester?: number;
  predator?: number;
  hardWorkingMiner?: number;
  centuryCake?: number;
  centuryCake200?: number;
  potatoTalisman?: number;
  freeCookie?: number;
}

export const PLAYER_CLAIMS = [
  "centuryCake",
  "centuryCake200",
  "potatoTalisman",
  "freeCookie",
] as const;

type PlayerClaim = (typeof PLAYER_CLAIMS)[number];

export interface PlayerExtras {
  highestSkills: Partial<Record<Skill, number>>;
  commissions: number; // over every profile
  claimed: Partial<Record<PlayerClaim, number>>; // when each was claimed
}

export interface SkyBlockProfilesView extends PlayerRef, Freshness {
  profiles: ProfileSummary[];
}

export interface ProfileSummary {
  id: string;
  cuteName: string;
  gameMode: GameMode;
  selected: boolean;
  members: {
    uuid: string;
    removed: boolean;
    invited: boolean;
    firstJoin?: number;
  }[];
  level: number;
  levelColor: string; // a § code
  xp: number;
  newProfile: boolean; // so missing data is empty, not hidden by an API setting
  purse: number;
  bank?: number;
  personalBank?: number;
  firstJoin?: number;
  fairySouls: number;
  maxFairySouls?: number; // missing on Stranded and Bingo
}

export interface SkyBlockProfileView
  extends PlayerRef, Freshness, ProfileSummary {
  member: MemberView;
  player?: PlayerExtras; // missing until the player's /player is stored
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
  museum?: MuseumView | null; // null with no museum fetched or nothing donated
  experiments?: ExperimentsSection | null;
  rift?: RiftSection | null;
  misc?: MiscSection;
  stats?: StatsSection;
  collections?: CollectionsSection | null;
  minions?: MinionsSection;
  bestiary?: BestiarySection;
  attributes?: AttributesSection;
}

// An inventory's slots, in the game's order.
export type Slots = (ItemView | null)[];

export interface GearSection {
  armor: Slots; // helmet to boots
  equipment: Slots; // necklace, cloak, belt, gloves
  wardrobe: { slot: number; armor: Slots }[];
  wardrobeSlot?: number;
  equipmentSets: { slot: number; equipment: Slots }[];
  equipmentSlot?: number;
  weapons: ItemView[]; // the inventory's, then the other storage's
  loadouts: Loadout[];
}

export interface Loadout {
  id: number;
  name: string;
  armorSet?: number; // a wardrobe slot
  equipmentSet?: number;
  pet?: string; // the pet's uniqueId
  power?: string;
  tuning?: Record<string, number>;
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
  "farmingToolkit",
  "huntingToolkit",
  "riftInventory",
  "riftEnderChest",
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
  bosses: Record<SlayerBoss, SlayerBossView>;
}

interface SlayerBossView {
  level: Level;
  kills: number[]; // kills[tier - 1]
  attempts: number[]; // as kills
  unclaimedLevels: number; // reached, with the reward not claimed
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
  bestRun?: DungeonRun; // the best scoring of the runs Hypixel keeps
}

export interface DungeonRun {
  score: number;
  grade: DungeonGrade;
  time: number; // ms
  dungeonClass: DungeonClass;
  secrets: number;
  deaths: number;
  damage: number;
  at: number;
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
    maxFossils: number;
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
  tokens: { spent: number; total: number };
  ability?: string;
  // Spent counts the selected loadout's only.
  whispers: Record<Whisper, { total: number; spent: number }>;
  nodes: TreeNode[];
}

export interface CrimsonSection {
  faction?: Faction;
  reputation: Record<Faction, number>;
  reputationRanks: Record<Faction, ReputationRank>;
  kuudra: KuudraTier[];
  dojo: DojoTest[];
  dojoPoints: number;
  dojoBelt: DojoBelt;
  minibosses: { boss: string; kills: number }[];
}

// Hypixel keeps a test's best points and best time apart.
interface DojoTest {
  test: string;
  points: number;
  grade?: DojoGrade; // missing before the test is taken
  time?: number; // ms
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
  highestWave?: number;
  texture: ItemTexture; // its key's
}

export interface FishingSection {
  trophyFish: TrophyFish[];
  trophyFishCaught: number;
  itemsFished: Record<"total" | Catch, number>;
  seaCreatureKills: number;
  seaCreatures: { name: string; kills: number }[]; // the most killed first
  trophyHunter?: TrophyHunterRank; // the highest of Odger's ranks claimed
}

export interface TrophyFish {
  id: string;
  name: string;
  tiers: Record<TrophyTier, number>;
}

export interface JacobSection {
  medals: Record<JacobMedal, number>; // unspent
  medalsEarned: Record<JacobBracket, number>; // over every contest claimed
  contests: number;
  uniqueGolds: number; // crops with a gold bracket or better
  crops: JacobCrop[];
  perks: { farmingFortune: number; farmingLevelCap: number }; // Anita's
  history: JacobContest[]; // the latest, newest first
}

export interface JacobContest {
  at: number; // when the contest's SkyBlock day began
  crop: string; // as JacobCrop's id
  collected: number;
  place?: number; // from 1, once the rewards are claimed
  participants?: number;
  medal?: JacobBracket;
}

export interface JacobCrop {
  id: string; // the API's item id, like INK_SACK:3
  name: string;
  texture?: ItemTexture;
  bracket?: JacobBracket; // the best one reached
  personalBest?: number;
}

export interface CollectionsSection {
  categories: { id: string; name: string; items: CollectionView[] }[];
  maxed: number;
  total: number;
  // Members Hypixel sends no collection for, so their part isn't counted.
  hidden: string[];
  bosses: BossCollection[]; // the member's own
}

export interface BossCollection {
  boss: string;
  amount: number;
  tier: number;
  maxTier: number;
  next?: number; // the amount the next tier needs
}

// A collection's amount is the co-op's, ex-members included.
export interface CollectionView {
  id: string;
  name: string;
  texture?: ItemTexture;
  amount: number;
  tier: number;
  maxTier: number;
  next?: number; // the amount the next tier needs
  members: { uuid: string; amount: number }[]; // most first
}

export interface MinionsSection {
  minions: {
    id: string;
    name: string;
    texture?: ItemTexture;
    tiers: number[];
    maxTier: number;
  }[];
  unique: number; // tiers crafted, each once
  total: number; // every tier of every minion
  // next is the unique crafts the next slot needs.
  slots: { total: number; crafts: number; community: number; next?: number };
  members: { uuid: string; amount: number }[]; // unique crafts, most first
}

export interface BestiarySection {
  milestone: number;
  tiers: number;
  maxTiers: number;
  maxed: number;
  total: number;
  pages: { category?: string; name: string; families: BestiaryFamilyView[] }[];
}

export interface BestiaryFamilyView {
  name: string;
  kills: number;
  tier: number;
  maxTier: number;
  next?: number; // the kills the next tier needs
}

export interface AttributesSection {
  attributes: {
    id: string;
    name: string;
    attribute: string;
    rarity: Rarity;
    families: string[];
    level: number;
    maxLevel: number; // 0 for a shard that can't be syphoned
    owned: number;
  }[];
  unlocked: number;
  maxed: number;
  total: number; // attributes with levels
  owned: number; // shards held
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
  level: number; // one more for each prestige
  chocolate: number;
  total: number; // all-time
  sincePrestige: number;
  nextPrestige?: number; // none after prestige VI, the last
  rabbits: { rarity: Rarity; found: number; total: number }[];
  employees: { employee: string; level: number }[];
  timeTower: number;
  duplicates: number; // rabbits found again
  eggLocations: number; // hidden egg spots found across the islands
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
  byAttribute?: Record<string, number>; // by the Hunting attribute's name
}

export interface StatsSection {
  stats: StatTotal[]; // in PLAYER_STATS' order
  weapon?: string;
  unverified: StatSource[];
}

export interface MiscSection {
  kills: number;
  deaths: number;
  topKills: { name: string; count: number }[]; // the 20 most
  topDeaths: { name: string; count: number }[];
  highestDamage?: number;
  highestCriticalDamage?: number;
  auctions: Record<AuctionStat, number>;
  gifts: { given: number; received: number };
  mythological: { kills: number; chains: number }; // burrow chains completed
  candy: number;
  soulflow: number;
  jerry: Partial<Record<JerryStat, number>>; // per Season of Jerry
  dragons: Dragons;
  // best is the share of notes hit, from 0 to 1.
  harp: { song: string; completions: number; perfect: number; best: number }[];
  galatea: {
    fishFamily: number;
    hinaTasks: number;
    treeGifts: Record<string, number>;
    starlyn: Record<string, number>;
  };
  consumables: Consumable[];
  upgrades: { upgrade: string; tier: number }[]; // the profile's community ones
}

export interface Dragons {
  summoned: number;
  eyesPlaced: number;
  crystalsDestroyed: number;
  fastestKill?: number; // ms
  mostDamage?: number;
  bestRank?: number; // the best place on a fight's damage list
  specialZealotLoot: number;
  summoningEyes: number; // collected from Zealots
}

export interface Consumable {
  id: string;
  name: string;
  texture?: ItemTexture;
  used: number;
  max: number;
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
  uniqueId?: string;
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
  tuningTotal?: number; // missing when no Tuning Box tier explains the points
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
  // slot is the slot's type (RUBY, COMBAT), and gem what's in it.
  gems?: { slot: string; gem: string; quality: string }[];
  counters?: Record<string, number>; // by API key, like champion_combat_xp
  dye?: string; // an item id
  rune?: { id: string; level: number };
  skin?: string;
  origin?: string; // how it was made or bought, like CRAFTING_GRID
  drillParts?: string[]; // item ids
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
      generator?: string; // a minion's type, on each of its tiers
      generatorTier?: number;
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
