/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { PLAYER_STATS, type PlayerStat, type StatValue } from "#types";
import { prettify, removeFormatting } from "@statsify/util";

// Newer item text draws stats with the SkyBlock pack's private-use glyphs, which the 1.8 font doesn't have.
// Each glyph maps to the symbol Hypixel's older lore puts in front of the same stat.
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

// 1.8 clears formatting at a color code, but Statsify's renderer keeps it. The added §r also clears an inline
// §^n^ size, so cards size item text with <text size>.
const FORMATTING_BEFORE_COLOR = /§[k-o](?:[^§]|§[k-o])*(?=§[\da-f])/gi;

// A dropped glyph takes the space after it when it starts a word ("§2<glyph> Undead" → "§2Undead"), and the space
// before it when punctuation follows ("Undead <glyph>!" → "Undead!")
const UNMAPPED_GLYPH = /(?<=(?:^|\s)(?:§.)*)\p{Co} | \p{Co}(?=(?!§)\p{P})|\p{Co}/gu;

/** Item text as 1.8 draws it, minus obfuscated text and glyphs with no 1.8 symbol (mob types, weather, newer stats). */
export function normalizeItemText(text: string) {
  return text
    .replaceAll(OBFUSCATED, "")
    .replaceAll(FORMATTING_BEFORE_COLOR, "$&§r")
    .replaceAll(/\p{Co}/gu, (glyph) => SYMBOLS[glyph] ?? glyph)
    .replaceAll(UNMAPPED_GLYPH, "");
}

const STAT_NAMES = new Map<string, PlayerStat>(
  PLAYER_STATS.flatMap((stat) =>
    [prettify(stat.id), ...("aliases" in stat ? stat.aliases : [])].map((name) => [name, stat.id] as const)
  )
);

/** The stat lore calls `name` ("Crit Damage", or an older name such as "Bonus Attack Speed"). */
export const statNamed = (name: string) => STAT_NAMES.get(name);

const amount = (text: string) => Number(text.replaceAll(",", ""));

/**
 * A normalized lore line's stat, "§7Strength: §c+140 §9(+40)": the number before the brackets is the item's total, with
 * its reforge, gems and enchantments in. undefined for other lines and for stats a player doesn't have (Damage).
 */
export function parseStatLine(line: string): StatValue | undefined {
  const match = /^([A-Z][\w' ]*): ([+-][\d,.]+)%?(?: |$)/.exec(removeFormatting(line));
  if (!match) return undefined;
  const stat = statNamed(match[1]);
  return stat && { stat, value: amount(match[2]) };
}

/**
 * The stats of an item's piece bonuses. "Piece Bonus: +15☘" names its stat only by symbol, and the bonus's description
 * names it in full ("gain ☘ Farming Fortune."). A bonus against some mobs, or while or when something holds, gives none.
 */
export function parsePieceBonuses(lore: string[]): StatValue[] {
  const lines = lore.map((line) => removeFormatting(line));

  return lines.flatMap((line, index) => {
    const match = /^Piece Bonus: \+([\d,.]+)(\S+)$/.exec(line);
    if (!match) return [];

    const start = lines.findLastIndex((other, at) => at < index && other.startsWith("Piece Bonus:"));
    const description = lines.slice(start + 1, index).join(" ");
    if (/\b(?:against|while|when)\b/.test(description)) return [];

    const name = /^[A-Z][\w']*(?: [A-Z][\w']*)*/.exec(description.split(`${match[2]} `)[1] ?? "")?.[0];
    const stat = name && statNamed(name);
    return stat ? [{ stat, value: amount(match[1]) }] : [];
  });
}

/**
 * Every "+5❤ Health" in normalized reward text (skill unlocks, pet items). A running total "+56➜60 ☘ Farming
 * Fortune" gives what the step adds.
 */
export function statRewards(text: string): StatValue[] {
  const rewards = removeFormatting(text).matchAll(
    /([+-][\d,.]+)(?:➜([\d,.]+))?%?[^\s\w]*(?: [^\s\w])? ([A-Z][\w']*(?: [A-Z][\w']*)*)/g
  );

  return [...rewards].flatMap(([, from, to, name]) => {
    const stat = statNamed(name);
    return stat ? [{ stat, value: to === undefined ? amount(from) : amount(to) - amount(from) }] : [];
  });
}

if (import.meta.vitest) {
  const { test, expect } = import.meta.vitest;

  test("normalizeItemText draws item text the way 1.8 does", () => {
    expect(normalizeItemText("§7Grants §c+5\uE010 Health §7and §a\uE008 Defense§7.")).toBe("§7Grants §c+5❤ Health §7and §a❈ Defense§7.");
    expect(normalizeItemText("§7Grants §d+3\uE05B Hunting Fortune§7.")).toBe("§7Grants §d+3 Hunting Fortune§7.");
    expect(normalizeItemText("§7taken from §2\uE084 Undead §7mobs")).toBe("§7taken from §2Undead §7mobs");
    expect(normalizeItemText("§d§lUltimate Wise V§9, §9Champion X")).toBe("§d§lUltimate Wise V§r§9, §9Champion X");
    expect(normalizeItemText("§d§l§ka§r §d§lMYTHIC ACCESSORY §d§l§ka")).toBe("§d§l§r §d§lMYTHIC ACCESSORY §r§d§l");
    expect(normalizeItemText("§6§LEPIC §9§KX§9 Shard")).toBe("§6§LEPIC §r§9§9 Shard");
  });

  test("parseStatLine, parsePieceBonuses and statRewards read stats out of lore", () => {
    expect(parseStatLine("§7Health: §c+125")).toEqual({ stat: "health", value: 125 });
    expect(parseStatLine("§7Sea Creature Chance: §3+0.25% §9(+0.25%)")).toEqual({ stat: "sea_creature_chance", value: 0.25 });
    expect(parseStatLine("§7Intelligence: §b+1,124 §9(+100) §d(+24)")).toEqual({ stat: "intelligence", value: 1124 });
    expect(parseStatLine("§7Speed: §c-5")).toEqual({ stat: "speed", value: -5 });
    expect(parseStatLine("§7Bonus Attack Speed: §c+3%")).toEqual({ stat: "attack_speed", value: 3 });
    expect(parseStatLine("§7Damage: §c+120")).toBeUndefined();
    expect(parseStatLine("§7Grants §c+5❤ Health §7and §a+2❈ Defense§7.")).toBeUndefined();

    const salesperson = ["§7Piece Bonus: §6Salesperson", "§7Complete Garden Visitor Offers to", "§7gain §6☘ Farming Fortune§7.", "§7Piece Bonus: §6+15☘"];
    expect(parsePieceBonuses(salesperson)).toEqual([{ stat: "farming_fortune", value: 15 }]);
    expect(parsePieceBonuses(["§7Kill Spiders to accumulate defense against them", "§7Piece Bonus: §a+215❈"])).toEqual([]);

    expect(statRewards("§7Grants §c+30❁ Strength§7 and §f+20✦ Speed§7.")).toEqual([
      { stat: "strength", value: 30 },
      { stat: "speed", value: 20 },
    ]);
    expect(statRewards("Farmhand XV   Grants +56➜60 ☘ Farming Fortune, which increases your chance")).toEqual([
      { stat: "farming_fortune", value: 4 },
    ]);
    expect(statRewards("+0.5%☣ Crit Chance")).toEqual([{ stat: "crit_chance", value: 0.5 }]);
    expect(statRewards("+100 Coins")).toEqual([]);
  });
}
