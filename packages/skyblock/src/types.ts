/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

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

export interface DungeonFloor {
  floor: number;
  played: number;
  completions: number;
  bestScore?: number;
  fastest?: number;
  fastestS?: number;
  fastestSPlus?: number;
}

export interface DungeonsSection {
  catacombs: Level;
  classes: Record<string, Level>;
  classAverage: number;
  selectedClass?: string;
  secrets: number;
  floors: Record<"normal" | "master", DungeonFloor[]>;
  highestFloor: Partial<Record<"normal" | "master", number>>;
}

export interface HotmSection {
  level: Level;
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

export interface PriceEntry {
  // A price is for one item, not a stack.
  coins: number;
  source: "bazaar" | "bin";
  listings?: number;
}

export interface PriceMap {
  asOf: number;
  entries: Record<string, PriceEntry>;
}

export interface MissingAccessory {
  id: string;
  name: string;
  rarity: Rarity;
  // The power counts only what it adds over the tier in the bag it replaces.
  accessoryPower: number;
  // Outside the bag means the inventory, ender chest, a backpack or the vault.
  outsideBag: boolean;
  // An accessory outside the bag has no price.
  price?: PriceEntry;
  replaces?: string;
  texture: ItemTexture;
}

export interface AccessoriesSection {
  accessoryPower: number;
  highestAccessoryPower?: number;
  selectedPower?: string;
  tuning: Record<string, number>;
  pricesAsOf: number;
  active: ItemView[];
  // Inactive ones are duplicates and tiers an upgrade in the bag replaces.
  inactive: ItemView[];
  // Missing ones outside the bag come first, then the most power.
  missing: MissingAccessory[];
}

export interface ItemView {
  // A vanilla item's id is "minecraft:<id>:<damage>".
  id: string;
  uuid?: string;
  name: string;
  // Lore keeps its § codes.
  lore: string[];
  rarity?: Rarity;
  count: number;
  glint: boolean;
  texture: ItemTexture;
  reforge?: string;
  stars?: number;
  recombobulated: boolean;
  enchantments?: Record<string, number>;
}

// An item's id is its 1.8 numeric id, and a head's skin is a texture hash.
export type ItemTexture =
  | { kind: "item"; id: number; damage: number; color?: number }
  | { kind: "head"; skin: string };

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
    }
  >;
}
