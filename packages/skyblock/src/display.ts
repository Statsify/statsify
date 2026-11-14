/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

// Its own entry, with no data, so the bot's cards and the site's pages draw names and rarities alike.
import type {
  DojoBelt,
  DojoGrade,
  DungeonClass,
  DungeonGrade,
  Faction,
  GameMode,
  JacobBracket,
  Powder,
  Rarity,
  RiftSection,
  Skill,
  SlayerBoss,
  Whisper,
} from "#types";

// The registries a page lists, from here rather than the root, whose NBT decoding would ride along into the browser.
export {
  AUCTION_STATS,
  CATCHES,
  COLLECTION_CATEGORIES,
  DUNGEON_CLASSES,
  INVENTORIES,
  JACOB_MEDALS,
  PLAYER_STATS,
  POWDERS,
  RARITIES,
  REPUTATION_RANKS,
  SKILLS,
  SLAYER_BOSSES,
  STAT_GROUPS,
  TROPHY_HUNTER_RANKS,
  TROPHY_TIERS,
  WHISPERS,
} from "#types";
export { type EventTime, SKYBLOCK_MONTHS, type SkyBlockDate, type SkyBlockEvent, nextEvents, skyblockDate, termOf } from "./calendar.js";

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
  "S": "§e",
  "A": "§5",
  "B": "§a",
  "C": "§9",
  "D": "§c",
};

export const POWDER_COLORS: Record<Powder, string> = {
  mithril: "§2",
  gemstone: "§d",
  glacite: "§b",
};

export const FACTION_COLORS: Record<Faction, string> = { mages: "§5", barbarians: "§c" };

export const DOJO_GRADE_COLORS: Record<DojoGrade, string> = { S: "§6", A: "§5", B: "§a", C: "§9", D: "§e", F: "§c" };

// Black as dark gray, which reads on the cards' dark backgrounds
export const DOJO_BELT_COLORS: Record<DojoBelt, string> = {
  white: "§f",
  yellow: "§e",
  green: "§a",
  blue: "§9",
  brown: "§6",
  black: "§8",
};

/** How many of each the Rift hides, which no data source has: the wiki's counts (an owner exception). */
export const RIFT_TOTALS = { enigmaSouls: 52, timecharms: 8, catsFound: 9 } as const satisfies Partial<Record<keyof RiftSection, number>>;

/** Jacob's contest brackets and medals, and the trophy fish tiers, which share four of them. */
export const MEDAL_COLORS: Record<JacobBracket, string> = {
  bronze: "§c",
  silver: "§f",
  gold: "§6",
  platinum: "§3",
  diamond: "§b",
};

export const WHISPER_COLORS: Record<Whisper, string> = { forest: "§a", desert: "§e" };

export const BOSS_COLORS: Record<SlayerBoss, string> = {
  zombie: "§a",
  spider: "§c",
  wolf: "§f",
  enderman: "§d",
  blaze: "§6",
  vampire: "§b",
};

/** The symbol after a profile's name in game; a normal profile has none. */
export const GAME_MODE_BADGES: Record<GameMode, string> = {
  normal: "",
  ironman: "§7♲",
  stranded: "§a☀",
  bingo: "§6Ⓑ",
};

export const hasMuseum = (gameMode: GameMode) => gameMode !== "bingo" && gameMode !== "stranded";

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

/** A profile's cute name in its fruit's colors, then its mode's badge after a space. */
export function formatProfileName({ cuteName, gameMode }: { cuteName: string; gameMode: GameMode }) {
  const badge = GAME_MODE_BADGES[gameMode];
  return `${FORMATTED_PROFILES[cuteName] ?? cuteName}${badge && ` ${badge}`}`;
}
