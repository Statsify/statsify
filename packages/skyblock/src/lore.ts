/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { PLAYER_STATS, type PlayerStat, type StatValue } from "#types";
import { prettify, removeFormatting } from "@statsify/util";

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

// Lore names a stat by its prettified id or by one of its older aliases.
const STAT_NAMES = new Map<string, PlayerStat>();

for (const stat of PLAYER_STATS) {
  STAT_NAMES.set(prettify(stat.id), stat.id);
  if (!("aliases" in stat)) continue;

  for (const alias of stat.aliases) STAT_NAMES.set(alias, stat.id);
}

export const parseStatName = (name: string) => STAT_NAMES.get(name);

const parseAmount = (text: string) => Number(text.replaceAll(",", ""));

const STAT_LINE = /^([A-Z][\w' ]*): ([+-][\d,.]+)%?(?: |$)/;

const PIECE_BONUS = /^Piece Bonus: \+([\d,.]+)(\S+)$/;

const STAT_REWARD =
  /([+-][\d,.]+)(?:➜([\d,.]+))?%?[^\s\w]*(?: [^\s\w])? ([A-Z][\w']*(?: [A-Z][\w']*)*)/g;

// The total before the brackets counts the reforge, gems and enchantments.
export function parseStatLine(line: string): StatValue | undefined {
  const match = STAT_LINE.exec(removeFormatting(line));
  if (!match) return undefined;

  const stat = parseStatName(match[1]);
  return stat && { stat, value: parseAmount(match[2]) };
}

// A bonus line names its stat by symbol, so the stat's name comes from above.
export function parsePieceBonuses(lore: string[]): StatValue[] {
  const lines = lore.map((line) => removeFormatting(line));
  const bonuses: StatValue[] = [];

  for (const [index, line] of lines.entries()) {
    const match = PIECE_BONUS.exec(line);
    if (!match) continue;

    const start = lines.findLastIndex(
      (other, at) => at < index && other.startsWith("Piece Bonus:"),
    );
    const description = lines.slice(start + 1, index).join(" ");

    // A bonus that only holds against some mobs or at some times isn't kept.
    if (/\b(?:against|while|when)\b/.test(description)) continue;

    const named = description.split(`${match[2]} `)[1] ?? "";
    const name = /^[A-Z][\w']*(?: [A-Z][\w']*)*/.exec(named)?.[0];
    const stat = name && parseStatName(name);
    if (stat) bonuses.push({ stat, value: parseAmount(match[1]) });
  }

  return bonuses;
}

// A running total like "+56➜60 ☘ Farming Fortune" gives what the step adds.
export function parseStatRewards(text: string): StatValue[] {
  const rewards: StatValue[] = [];

  for (const [, from, to, name] of removeFormatting(text).matchAll(
    STAT_REWARD,
  )) {
    const stat = parseStatName(name);
    if (!stat) continue;

    const value =
      to === undefined
        ? parseAmount(from)
        : parseAmount(to) - parseAmount(from);
    rewards.push({ stat, value });
  }

  return rewards;
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

  suite("parseStatLine", () => {
    it("should read the item's total for the stat", () => {
      expect(parseStatLine("§7Health: §c+125")).toEqual({
        stat: "health",
        value: 125,
      });
      expect(
        parseStatLine("§7Intelligence: §b+1,124 §9(+100) §d(+24)"),
      ).toEqual({ stat: "intelligence", value: 1124 });
      expect(parseStatLine("§7Speed: §c-5")).toEqual({
        stat: "speed",
        value: -5,
      });
    });

    it("should read percents and older names", () => {
      expect(
        parseStatLine("§7Sea Creature Chance: §3+0.25% §9(+0.25%)"),
      ).toEqual({ stat: "sea_creature_chance", value: 0.25 });
      expect(parseStatLine("§7Bonus Attack Speed: §c+3%")).toEqual({
        stat: "attack_speed",
        value: 3,
      });
    });

    it("should skip stats a player doesn't have and other lines", () => {
      expect(parseStatLine("§7Damage: §c+120")).toBeUndefined();
      expect(
        parseStatLine("§7Grants §c+5❤ Health §7and §a+2❈ Defense§7."),
      ).toBeUndefined();
    });
  });

  suite("parsePieceBonuses", () => {
    it("should name the stat from the bonus's description", () => {
      const salesperson = [
        "§7Piece Bonus: §6Salesperson",
        "§7Complete Garden Visitor Offers to",
        "§7gain §6☘ Farming Fortune§7.",
        "§7Piece Bonus: §6+15☘",
      ];
      expect(parsePieceBonuses(salesperson)).toEqual([
        { stat: "farming_fortune", value: 15 },
      ]);
    });

    it("should skip a bonus against some mobs", () => {
      const lore = [
        "§7Kill Spiders to accumulate defense against them",
        "§7Piece Bonus: §a+215❈",
      ];
      expect(parsePieceBonuses(lore)).toEqual([]);
    });
  });

  suite("parseStatRewards", () => {
    it("should read every stat in the text", () => {
      expect(
        parseStatRewards("§7Grants §c+30❁ Strength§7 and §f+20✦ Speed§7."),
      ).toEqual([
        { stat: "strength", value: 30 },
        { stat: "speed", value: 20 },
      ]);
      expect(parseStatRewards("+0.5%☣ Crit Chance")).toEqual([
        { stat: "crit_chance", value: 0.5 },
      ]);
    });

    it("should give what a running total's step adds", () => {
      const text =
        "Farmhand XV   Grants +56➜60 ☘ Farming Fortune, which increases";
      expect(parseStatRewards(text)).toEqual([
        { stat: "farming_fortune", value: 4 },
      ]);
    });

    it("should skip rewards that aren't stats", () => {
      expect(parseStatRewards("+100 Coins")).toEqual([]);
    });
  });
}
