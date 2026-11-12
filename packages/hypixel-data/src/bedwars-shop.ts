/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import type { ItemStack, PotionEffect } from "@statsify/textures";

// The BedWars item shop as Hypixel's NBT had it in game on 2026-10-26, with 26.3 ids. The shop
// shows white wool and plain clay and glass whatever your team.

type Currency = "iron" | "gold" | "emerald";

export interface ShopItem {
  /** Without "minecraft:", when it isn't the token */
  id?: string;
  name: string;
  count?: number;
  cost: readonly [amount: number, currency: Currency];
  /** Gray lines under the cost */
  description?: readonly string[];
  /** A tool bought in tiers, which the shop shows at its first */
  upgradable?: boolean;
  enchanted?: boolean;
  effects?: PotionEffect[];
}

/** favourites_2's tokens */
export const SHOP_ITEMS: Record<string, ShopItem> = {
  wool: {
    id: "white_wool",
    name: "Wool",
    count: 16,
    cost: [4, "iron"],
    description: ["Great for bridging across islands.", "Turns into your team's color."],
  },
  hardened_clay: {
    id: "terracotta",
    name: "Hardened Clay",
    count: 16,
    cost: [12, "iron"],
    description: ["Basic block to defend your bed."],
  },
  "blast-proof_glass": {
    id: "glass",
    name: "Blast-Proof Glass",
    count: 4,
    cost: [12, "iron"],
    description: ["Immune to explosions."],
  },
  end_stone: { name: "End Stone", count: 12, cost: [24, "iron"], description: ["Solid block to defend your bed."] },
  ladder: { name: "Ladder", count: 8, cost: [4, "iron"], description: ["Useful to save cats stuck in trees."] },
  oak_wood_planks: {
    id: "oak_planks",
    name: "Wood",
    count: 16,
    cost: [4, "gold"],
    description: ["Good block to defend your bed.", "Strong against pickaxes."],
  },
  obsidian: { name: "Obsidian", count: 4, cost: [4, "emerald"], description: ["Extreme protection for your bed."] },

  stone_sword: { name: "Stone Sword", cost: [10, "iron"] },
  iron_sword: { name: "Iron Sword", cost: [7, "gold"] },
  diamond_sword: { name: "Diamond Sword", cost: [4, "emerald"] },
  "stick_(knockback_i)": { id: "stick", name: "Stick (Knockback I)", cost: [5, "gold"], enchanted: true },

  chainmail_boots: {
    name: "Permanent Chainmail Armor",
    cost: [24, "iron"],
    description: ["Chainmail leggings and boots which", "you will always spawn with."],
  },
  iron_boots: {
    name: "Permanent Iron Armor",
    cost: [12, "gold"],
    description: ["Iron leggings and boots which you", "will always spawn with."],
  },
  diamond_boots: {
    name: "Permanent Diamond Armor",
    cost: [6, "emerald"],
    description: ["Diamond leggings and boots which", "you will always crush with."],
  },

  shears: {
    name: "Permanent Shears",
    cost: [20, "iron"],
    description: ["Great to get rid of wool. You will", "always spawn with these shears."],
  },
  wooden_pickaxe: { name: "Wooden Pickaxe (Efficiency I)", cost: [10, "iron"], upgradable: true, enchanted: true },
  wooden_axe: { name: "Wooden Axe (Efficiency I)", cost: [10, "iron"], upgradable: true, enchanted: true },

  arrow: { name: "Arrow", count: 6, cost: [2, "gold"] },
  bow: { name: "Bow", cost: [12, "gold"] },
  "bow_(power_i)": { id: "bow", name: "Bow (Power I)", cost: [20, "gold"], enchanted: true },
  "bow_(power_i__punch_i)": { id: "bow", name: "Bow (Power I, Punch I)", cost: [6, "emerald"], enchanted: true },

  "speed_ii_potion_(45_seconds)": {
    id: "potion",
    name: "Speed II Potion (45 seconds)",
    cost: [1, "emerald"],
    description: ["§9Speed II (0:45)."],
    effects: [{ id: "minecraft:speed", amplifier: 1 }],
  },
  "jump_v_potion_(45_seconds)": {
    id: "potion",
    name: "Jump V Potion (45 seconds)",
    cost: [1, "emerald"],
    description: ["§9Jump Boost V (0:45)."],
    effects: [{ id: "minecraft:jump_boost", amplifier: 4 }],
  },
  "invisibility_potion_(30_seconds)": {
    id: "potion",
    name: "Invisibility Potion (30 seconds)",
    cost: [2, "emerald"],
    description: ["§9Complete Invisibility (0:30)."],
    effects: [{ id: "minecraft:invisibility" }],
  },

  golden_apple: { name: "Golden Apple", cost: [3, "gold"], description: ["Well-rounded healing."] },
  bedbug: {
    id: "snowball",
    name: "Bedbug",
    cost: [24, "iron"],
    description: ["Spawns silverfish where the snowball", "lands to distract your enemies.", "Lasts 15 seconds."],
  },
  dream_defender: {
    id: "iron_golem_spawn_egg",
    name: "Dream Defender",
    cost: [120, "iron"],
    description: ["Iron Golem to help defend your", "base. Lasts 4 minutes."],
  },
  fireball: {
    id: "fire_charge",
    name: "Fireball",
    cost: [40, "iron"],
    description: ["Right-click to launch! Great to knock", "back enemies walking on thin bridges."],
  },
  tnt: { name: "TNT", cost: [4, "gold"], description: ["Instantly ignites, appropriate to", "explode things!"] },
  ender_pearl: {
    name: "Ender Pearl",
    cost: [4, "emerald"],
    description: ["The quickest way to invade enemy", "bases."],
  },
  water_bucket: {
    name: "Water Bucket",
    cost: [2, "gold"],
    description: ["Great to slow down approaching", "enemies. Can also protect against", "TNT."],
  },
  bridge_egg: {
    id: "egg",
    name: "Bridge Egg",
    cost: [1, "emerald"],
    description: ["This egg creates a bridge in its trail", "after being thrown."],
  },
  magic_milk: {
    id: "milk_bucket",
    name: "Magic Milk",
    cost: [4, "gold"],
    description: ["Avoid triggering traps for 30", "seconds after consuming."],
  },
  sponge: { name: "Sponge", count: 4, cost: [2, "gold"], description: ["Great for soaking up water."] },
  "compact_pop-up_tower": {
    id: "trapped_chest",
    name: "Compact Pop-up Tower",
    cost: [24, "iron"],
    description: ["Place a pop-up defence!"],
  },

  // Rotating Items, which come and go
  rotation_item_proximity_mine: {
    id: "stone_pressure_plate",
    name: "Proximity Mine",
    cost: [4, "gold"],
    description: ["Proximity IED. Can be disarmed by", "shooting them."],
  },
  rotation_item_time_warp_pearl: {
    id: "ender_pearl",
    name: "Time Warp Pearl",
    cost: [3, "emerald"],
    description: ["After 5 seconds you will be", "teleported back to your original", "location."],
  },
};

export const UPGRADABLE = [
  "This is an upgradable item.",
  "It will lose 1 tier upon death!",
  "",
  "You will permanently respawn with at",
  "least the lowest tier.",
];

export const CURRENCIES = {
  iron: { color: "§f", name: "Iron" },
  gold: { color: "§6", name: "Gold" },
  emerald: { color: "§2", name: "Emerald" },
} as const;

export const SHOP_CATEGORIES = [
  { id: "minecraft:nether_star", name: "§bQuick Buy" },
  { id: "minecraft:terracotta", name: "§aBlocks" },
  { id: "minecraft:golden_sword", name: "§aMelee" },
  { id: "minecraft:chainmail_boots", name: "§aArmor" },
  { id: "minecraft:stone_pickaxe", name: "§aTools" },
  { id: "minecraft:bow", name: "§aRanged" },
  { id: "minecraft:brewing_stand", name: "§aPotions" },
  { id: "minecraft:tnt", name: "§aUtility" },
  { id: "minecraft:redstone_torch", name: "§aRotating Items" },
] as const;

export const NOT_SELECTED_LORE = ["§eClick to view!"];

/** The second row's panes, lime under the open category */
export const PANES = {
  selected: "minecraft:lime_stained_glass_pane",
  notSelected: "minecraft:gray_stained_glass_pane",
  name: "§8⬆ §7Categories",
  lore: ["§8⬇ §7Items"],
};

export const EMPTY_SLOT: ItemStack = {
  id: "minecraft:red_stained_glass_pane",
  name: "§cEmpty slot!",
  lore: ["§7This is a Quick Buy Slot! §bShift Click", "§b§7any item in the shop to add it here."],
};

/** Quick Buy's bottom row, which the other categories don't have */
export const TRACKER_SHOP: ItemStack = {
  id: "minecraft:compass",
  name: "§aTracker Shop",
  lore: [
    "§7Purchase tracking upgrade for your",
    "§7compass which will track each player",
    "§7on a specific team until you die.",
  ],
};

export const HOTBAR_MANAGER: ItemStack = {
  id: "minecraft:blaze_powder",
  name: "§aHotbar Manager",
  lore: ["§7Edit preferred slots for your items", "§7per category.", "", "§eClick to edit!"],
};

// Not dumped from an unedited account: the first 14 slots as saved players have them
export const DEFAULT_QUICK_BUY =
  "wool,stone_sword,chainmail_boots,wooden_pickaxe,bow,speed_ii_potion_(45_seconds),tnt,oak_wood_planks,iron_sword,iron_boots,shears,arrow,invisibility_potion_(30_seconds),water_bucket";

/** The favorite_slots a player who never saved a hotbar gets, from the Hotbar Manager */
export const DEFAULT_HOTBAR = "Melee,null,null,null,null,null,null,null,Compass";

/** favorite_slots' categories as the Hotbar Manager shows them */
export const HOTBAR_CATEGORIES: Record<string, string> = {
  Blocks: "minecraft:terracotta",
  Melee: "minecraft:golden_sword",
  Pickaxe: "minecraft:iron_pickaxe",
  Axe: "minecraft:iron_axe",
  Shears: "minecraft:shears",
  Ranged: "minecraft:bow",
  Potions: "minecraft:brewing_stand",
  Utility: "minecraft:tnt",
  Compass: "minecraft:compass",
};
