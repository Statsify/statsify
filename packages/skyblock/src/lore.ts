/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

// The 1.8 font lacks the pack's stat glyphs, so each maps to its old symbol.
const STAT_GLYPHS: Record<string, [glyph: string, symbol: string]> = {
  attackSpeed: ["\uE001", "⚔"],
  abilityDamage: ["\uE002", "๑"],
  intelligence: ["\uE003", "✎"],
  manaRegen: ["\uE004", "⚡"],
  breakingPower: ["\uE005", "Ⓟ"],
  coldResistance: ["\uE006", "❄"],
  critDamage: ["\uE007", "☠"],
  defense: ["\uE008", "❈"],
  doubleHookChance: ["\uE009", "⚓"],
  ferocity: ["\uE00B", "⫽"],
  fishingSpeed: ["\uE00C", "☂"],
  strength: ["\uE00D", "❁"],
  fuel: ["\uE00E", "♢"],
  gemstoneSpread: ["\uE00F", "▚"],
  health: ["\uE010", "❤"],
  healthRegen: ["\uE011", "❣"],
  heatResistance: ["\uE012", "♨"],
  petLuck: ["\uE013", "♣"],
  mending: ["\uE014", "☄"],
  miningSpeed: ["\uE015", "⸕"],
  miningSpread: ["\uE016", "▚"],
  overflow: ["\uE017", "ʬ"],
  pests: ["\uE018", "ൠ"],
  bonusPestChance: ["\uE019", "ൠ"],
  magicFind: ["\uE01A", "✯"],
  pressureResistance: ["\uE01B", "❍"],
  pristine: ["\uE01C", "✧"],
  respiration: ["\uE01D", "⚶"],
  riftDamage: ["\uE01E", "❁"],
  riftHearts: ["\uE01F", "❤"],
  riftTime: ["\uE020", "ф"],
  seaCreatureChance: ["\uE021", "α"],
  speed: ["\uE022", "✦"],
  sweep: ["\uE023", "∮"],
  swingRange: ["\uE024", "Ⓢ"],
  treasureChance: ["\uE025", "⛃"],
  trueDefense: ["\uE027", "❂"],
  vitality: ["\uE028", "♨"],
  trophyChance: ["\uE02A", "♔"],
  overbloom: ["\uE02B", "☀"],
  critChance: ["\uE02C", "☣"],
  damage: ["\uE050", "❁"],
  farmingFortune: ["\uE051", "☘"],
  miningFortune: ["\uE053", "☘"],
  foragingFortune: ["\uE054", "☘"],
  fragged: ["\uE068", "⚚"],
  tracking: ["\uE077", "❃"],
};

const SYMBOLS = new Map(Object.values(STAT_GLYPHS));

// Obfuscated text runs until a color code or §r
const OBFUSCATED = /§k(?:[^§]|§[k-o])*/gi;

// Our renderer needs a §r where 1.8 clears formatting at a color code.
const FORMATTING_BEFORE_COLOR = /§[k-o](?:[^§]|§[k-o])*(?=§[\da-f])/gi;

// A dropped glyph takes the space after it, or before it ahead of punctuation.
const UNMAPPED_GLYPH =
  /(?<=(?:^|\s)(?:§.)*)\p{Co} | \p{Co}(?=(?!§)\p{P})|\p{Co}/gu;

const NEEDS_NORMALIZING = /§[k-o]|\p{Co}/iu;

export function normalizeItemText(text: string) {
  if (!NEEDS_NORMALIZING.test(text)) return text;

  // The added §r also clears an inline §^n^ size, so cards use <text size>.
  return text
    .replaceAll(OBFUSCATED, "")
    .replaceAll(FORMATTING_BEFORE_COLOR, "$&§r")
    .replaceAll(/\p{Co}/gu, (glyph) => SYMBOLS.get(glyph) ?? glyph)
    .replaceAll(UNMAPPED_GLYPH, "");
}

if (import.meta.vitest) {
  const { suite, it, expect } = import.meta.vitest;

  suite("normalizeItemText", () => {
    it("should draw stat glyphs as their 1.8 symbols", () => {
      expect(
        normalizeItemText(
          "§7Grants §c+5\uE010 Health §7and §a\uE008 Defense§7.",
        ),
      ).toBe("§7Grants §c+5❤ Health §7and §a❈ Defense§7.");
    });

    it("should drop a glyph with no symbol and its space", () => {
      expect(normalizeItemText("§7Grants §d+3\uE05B Hunting Fortune§7.")).toBe(
        "§7Grants §d+3 Hunting Fortune§7.",
      );
      expect(normalizeItemText("§7taken from §2\uE084 Undead §7mobs")).toBe(
        "§7taken from §2Undead §7mobs",
      );
    });

    it("should reset formatting before a color code", () => {
      expect(normalizeItemText("§d§lUltimate Wise V§9, §9Champion X")).toBe(
        "§d§lUltimate Wise V§r§9, §9Champion X",
      );
    });

    it("should drop obfuscated text", () => {
      expect(normalizeItemText("§d§l§ka§r §d§lMYTHIC ACCESSORY §d§l§ka")).toBe(
        "§d§l§r §d§lMYTHIC ACCESSORY §r§d§l",
      );
      expect(normalizeItemText("§6§LEPIC §9§KX§9 Shard")).toBe(
        "§6§LEPIC §r§9§9 Shard",
      );
    });
  });
}
