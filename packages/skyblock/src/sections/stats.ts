/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  type ItemView,
  PLAYER_STATS,
  type PlayerStat,
  SKILLS,
  STAT_SOURCES,
  type Slots,
  type StatSource,
  type StatTotal,
  type StatsSection,
} from "#types";
import { STAT_TABLES } from "#data";
import { add, roundTo } from "@statsify/math";
import { decodeSlots } from "#items";
import { getPets } from "./pets.js";
import { getSkills } from "./skills.js";
import { getSlayers } from "./slayers.js";
import { isWeapon } from "./gear.js";
import { parsePieceBonuses, parseStatLine } from "../lore.js";
import type { RawMember, RawProfile } from "#raw";

type Stats = Partial<Record<PlayerStat, number>>;

const sumStats = (all: Iterable<Stats>): Stats => {
  const sum: Stats = {};
  for (const stats of all) {
    for (const [stat, value] of Object.entries(stats) as [PlayerStat, number][]) sum[stat] = add(sum[stat] ?? 0, value);
  }
  return sum;
};

/** The stat lines in the items' lore, which already count each item's reforge, gems, enchantments and stars. */
const loreStats = (items: Slots): Stats =>
  sumStats(
    items.flatMap((item) => {
      const lore = item?.lore ?? [];
      return [...lore.flatMap((line) => parseStatLine(line) ?? []), ...parsePieceBonuses(lore)].map(({ stat, value }) => ({
        [stat]: value,
      }));
    })
  );

/** The stats of a table's first `level` levels. */
const upTo = (levels: readonly Stats[], level: number) => sumStats(levels.slice(0, level));

// Blaze levels' stats (wiki: Blaze Slayer), which NEU's bonus table lacks. Vampire's are Rift Time, a Rift-only stat.
const BLAZE_LEVELS: Stats[] = [
  { health: 3 },
  { strength: 1 },
  { health: 4 },
  { true_defense: 1 },
  { health: 5 },
  { strength: 2 },
  { health: 6 },
  { true_defense: 2 },
  { health: 7 },
];

// Pet score's Magic Find past NEU's last step at 325 (wiki: Pet Score)
const PET_SCORE_STEPS = { ...STAT_TABLES.pet_score, 375: 11, 450: 12, 500: 13 };
const UNVERIFIED_PET_SCORE = 375;

const petScoreMagicFind = (score: number) =>
  Math.max(0, ...Object.entries(PET_SCORE_STEPS).flatMap(([at, magicFind]) => (score >= Number(at) ? [magicFind] : [])));

/** Each stat with a source, by source; rounded to two places, as lore shows them. */
function toTotals(sources: Partial<Record<StatSource, Stats>>): StatTotal[] {
  return PLAYER_STATS.flatMap(({ id: stat }) => {
    const bySource = Object.fromEntries(
      STAT_SOURCES.flatMap((source) => {
        const value = roundTo(sources[source]?.[stat] ?? 0);
        return value === 0 ? [] : [[source, value]];
      })
    );
    const values = Object.values(bySource);
    return values.length === 0 ? [] : [{ stat, total: roundTo(add(...values)), bySource }];
  });
}

/**
 * The permanent stat sheet. Gear and the weapon need the inventory API and skills the skills API; with either off, its
 * sources are left out.
 */
export function getStats(profile: RawProfile, member: RawMember): StatsSection {
  const inventory = member.inventory;
  const hotbar = inventory?.inv_contents ? decodeSlots(inventory.inv_contents).slice(0, 9) : [];
  const weapon = hotbar.find((item): item is ItemView => item !== null && isWeapon(item));

  const skills = getSkills(profile, member);
  const slayers = getSlayers(member).bosses;
  const score = getPets(member).score;

  const sources: Partial<Record<StatSource, Stats>> = {
    base: STAT_TABLES.base,
    armor: inventory?.inv_armor ? loreStats(decodeSlots(inventory.inv_armor)) : undefined,
    equipment: inventory?.equipment_contents ? loreStats(decodeSlots(inventory.equipment_contents)) : undefined,
    weapon: weapon && loreStats([weapon]),
    skills: skills ? sumStats(SKILLS.map((skill) => upTo(STAT_TABLES.skills[skill], skills.skills[skill].level))) : undefined,
    slayers: sumStats(
      Object.entries(STAT_TABLES.slayers).map(([boss, levels]) => upTo(levels, slayers[boss as keyof typeof slayers].level.level))
    ),
    blaze: upTo(BLAZE_LEVELS, slayers.blaze.level.level),
    petScore: { magic_find: petScoreMagicFind(score) },
  };

  const unverified: StatSource[] = [];
  if (slayers.blaze.level.level > 0) unverified.push("blaze");
  if (score >= UNVERIFIED_PET_SCORE) unverified.push("petScore");

  return { stats: toTotals(sources), weapon: weapon?.name, unverified };
}
