/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import type { DungeonClass } from "./sections/dungeons.js";
import type { DungeonGrade, GameMode, Rarity } from "#types";
import type { Faction } from "./sections/crimson.js";
import type { JacobBracket } from "./sections/jacob.js";
import type { Powder } from "./sections/hotm.js";
import type { Skill } from "./sections/skills.js";
import type { SlayerBoss } from "./sections/slayers.js";
import type { Whisper } from "./sections/hotf.js";

// Pages take registries from here, since the root pulls NBT decoding along.
export { AUCTION_STATS } from "./sections/misc.js";
export { CATCHES, TROPHY_TIERS } from "./sections/fishing.js";
export { DUNGEON_CLASSES } from "./sections/dungeons.js";
export { JACOB_MEDALS } from "./sections/jacob.js";
export { POWDERS } from "./sections/hotm.js";
export { INVENTORIES, PLAYER_STATS, RARITIES, STAT_GROUPS } from "#types";
export { SKILLS } from "./sections/skills.js";
export { SLAYER_BOSSES } from "./sections/slayers.js";
export { WHISPERS } from "./sections/hotf.js";

export const RARITY_COLORS: Record<Rarity, string> = {
  COMMON: "§f",
  UNCOMMON: "§a",
  RARE: "§9",
  EPIC: "§5",
  LEGENDARY: "§6",
  MYTHIC: "§d",
  DIVINE: "§b",
  SPECIAL: "§c",
  VERY_SPECIAL: "§c",
  ULTIMATE: "§4",
  ADMIN: "§4",
};

export const SKILL_COLORS: Record<Skill, string> = {
  farming: "§e",
  mining: "§7",
  combat: "§c",
  foraging: "§2",
  fishing: "§3",
  enchanting: "§5",
  alchemy: "§d",
  taming: "§a",
  carpentry: "§6",
  hunting: "§b",
  runecrafting: "§d",
  social: "§a",
};

export const CLASS_COLORS: Record<DungeonClass, string> = {
  healer: "§d",
  mage: "§b",
  berserk: "§c",
  archer: "§6",
  tank: "§7",
};

export const GRADE_COLORS: Record<DungeonGrade, string> = {
  "S+": "§6",
  S: "§e",
  A: "§5",
  B: "§a",
  C: "§9",
  D: "§c",
};

export const POWDER_COLORS: Record<Powder, string> = {
  mithril: "§2",
  gemstone: "§d",
  glacite: "§b",
};

export const FACTION_COLORS: Record<Faction, string> = {
  mages: "§5",
  barbarians: "§c",
};

// Trophy fish tiers share four of these colors.
export const MEDAL_COLORS: Record<JacobBracket, string> = {
  bronze: "§c",
  silver: "§f",
  gold: "§6",
  platinum: "§3",
  diamond: "§b",
};

export const WHISPER_COLORS: Record<Whisper, string> = {
  forest: "§a",
  desert: "§e",
};

export const BOSS_COLORS: Record<SlayerBoss, string> = {
  zombie: "§a",
  spider: "§c",
  wolf: "§f",
  enderman: "§d",
  blaze: "§6",
  vampire: "§b",
};

export const GAME_MODE_BADGES: Record<GameMode, string> = {
  normal: "",
  ironman: "§7♲",
  stranded: "§a☀",
  bingo: "§6Ⓑ",
};

export const hasMuseum = (gameMode: GameMode) =>
  gameMode !== "bingo" && gameMode !== "stranded";

const FORMATTED_PROFILES: Record<string, string | undefined> = {
  Apple: "§cApple",
  Banana: "§eBanana",
  Blueberry: "§9Blueberry",
  Coconut: "§6Coco§fnut",
  Cucumber: "§2Cucumber",
  Grapes: "§5Grapes",
  Kiwi: "§aKiwi",
  Lemon: "§eLemon",
  Lime: "§aLime",
  Mango: "§6Mango",
  Orange: "§6Orange",
  Papaya: "§6Papaya",
  Peach: "§dPeach",
  Pear: "§aPear",
  Pineapple: "§ePineapple",
  Pomegranate: "§4Pomegranate",
  Raspberry: "§dRaspberry",
  Strawberry: "§cStrawberry",
  Tomato: "§cTomato",
  Watermelon: "§aWater§cmelon",
  Zucchini: "§2Zucchini",
};

export function formatProfileName({
  cuteName,
  gameMode,
}: {
  cuteName: string;
  gameMode: GameMode;
}) {
  const badge = GAME_MODE_BADGES[gameMode];
  return `${FORMATTED_PROFILES[cuteName] ?? cuteName}${badge && ` ${badge}`}`;
}
