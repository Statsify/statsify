/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

// The 1.8 font lacks the pack's stat glyphs, so each maps to its old symbol.
const SYMBOLS: Record<string, string> = {
  "\uE001": "⚔", // Attack Speed
  "\uE002": "๑", // Ability Damage
  "\uE003": "✎", // Intelligence
  "\uE004": "⚡", // Mana Regen
  "\uE005": "Ⓟ", // Breaking Power
  "\uE006": "❄", // Cold Resistance
  "\uE007": "☠", // Crit Damage
  "\uE008": "❈", // Defense
  "\uE009": "⚓", // Double Hook Chance
  "\uE00B": "⫽", // Ferocity
  "\uE00C": "☂", // Fishing Speed
  "\uE00D": "❁", // Strength
  "\uE00E": "♢", // Fuel
  "\uE00F": "▚", // Gemstone Spread
  "\uE010": "❤", // Health
  "\uE011": "❣", // Health Regen
  "\uE012": "♨", // Heat Resistance
  "\uE013": "♣", // Pet Luck
  "\uE014": "☄", // Mending
  "\uE015": "⸕", // Mining Speed
  "\uE016": "▚", // Mining Spread
  "\uE017": "ʬ", // Overflow
  "\uE018": "ൠ", // Pests
  "\uE019": "ൠ", // Bonus Pest Chance
  "\uE01A": "✯", // Magic Find
  "\uE01B": "❍", // Pressure Resistance
  "\uE01C": "✧", // Pristine
  "\uE01D": "⚶", // Respiration
  "\uE01E": "❁", // Rift Damage
  "\uE01F": "❤", // Heart (the Rift)
  "\uE020": "ф", // Rift Time
  "\uE021": "α", // Sea Creature Chance
  "\uE022": "✦", // Speed
  "\uE023": "∮", // Sweep
  "\uE024": "Ⓢ", // Swing Range
  "\uE025": "⛃", // Treasure Chance
  "\uE027": "❂", // True Defense
  "\uE028": "♨", // Vitality
  "\uE02A": "♔", // Trophy Chance
  "\uE02B": "☀", // Overbloom
  "\uE02C": "☣", // Crit Chance
  "\uE050": "❁", // Damage
  "\uE051": "☘", // Farming Fortune
  "\uE053": "☘", // Mining Fortune
  "\uE054": "☘", // Foraging Fortune
  "\uE068": "⚚", // Fragged items
  "\uE077": "❃", // Tracking
};

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

  return text
    .replaceAll(OBFUSCATED, "")
    .replaceAll(FORMATTING_BEFORE_COLOR, "$&§r")
    .replaceAll(/\p{Co}/gu, (glyph) => SYMBOLS[glyph] ?? glyph)
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
