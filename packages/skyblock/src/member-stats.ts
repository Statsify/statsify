/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { AVERAGED, xpOf } from "./sections/skills.js";
import {
  DUNGEON_CLASSES,
  type DungeonClass,
  KUUDRA_TIERS,
  type Level,
  type Faction,
  type MemberView,
  POWDERS,
  type Powder,
  SKILLS,
  SLAYER_BOSSES,
  type Skill,
  type SlayerBoss,
} from "#types";
import { BESTIARY, COLLECTIONS } from "#data";
import { add } from "@statsify/math";
import { bagAccessories } from "./sections/accessories.js";
import { isMember, toProfileSummary } from "./profiles.js";
import type { SectionInput, SkyBlockSection } from "./sections/index.js";

/** The sections a member's stats come from; the level and fairy souls are the profile summary's. */
export const MEMBER_STATS_SECTIONS = [
  "bestiary",
  "chocolate",
  "collections",
  "crimson",
  "dungeons",
  "fishing",
  "hotm",
  "jacob",
  "networth",
  "pets",
  "skills",
  "slayers",
] as const satisfies readonly SkyBlockSection[];

const KUUDRA_STATS = {
  none: "kuudraBasic",
  hot: "kuudraHot",
  burning: "kuudraBurning",
  fiery: "kuudraFiery",
  infernal: "kuudraInfernal",
} as const satisfies Record<(typeof KUUDRA_TIERS)[number], string>;

// The page's Social is the co-op's sum and level, so its board ranks the member's own XP, with no level
type LeveledSkill = Exclude<Skill, "social">;
const LEVELED_SKILLS = SKILLS.filter((skill): skill is LeveledSkill => skill !== "social");

export type MemberStat =
  | "xp"
  | "level"
  | "networth"
  | "nonCosmeticNetworth"
  | "unsoulboundNetworth"
  | "skillAverage"
  | "skillAverageOrder"
  | `${Skill}Xp`
  | `${LeveledSkill}Level`
  | "catacombsXp"
  | "catacombsLevel"
  | `${DungeonClass}Xp`
  | `${DungeonClass}Level`
  | "secrets"
  | "slayerXp"
  | `${SlayerBoss}Xp`
  | `${SlayerBoss}Level`
  | (typeof KUUDRA_STATS)[keyof typeof KUUDRA_STATS]
  | "hotmXp"
  | "hotmLevel"
  | `${Powder}Powder`
  | `${Faction}Reputation`
  | "kills"
  | "accessoryPower"
  | "petScore"
  | "fairySouls"
  | "trophyFish"
  | "chocolate";

export const FLOOR_BOARDS = [
  "entrance",
  "floor1",
  "floor2",
  "floor3",
  "floor4",
  "floor5",
  "floor6",
  "floor7",
  "master1",
  "master2",
  "master3",
  "master4",
  "master5",
  "master6",
  "master7",
] as const;

export type FloorBoard = (typeof FLOOR_BOARDS)[number];

// The crop ids Jacob's contests use, by the board each ranks its personal best on
export const CROP_BOARDS = {
  CACTUS: "cactus",
  CARROT_ITEM: "carrot",
  "INK_SACK:3": "cocoaBeans",
  MELON: "melon",
  MOONFLOWER: "moonflower",
  MUSHROOM_COLLECTION: "mushroom",
  NETHER_STALK: "netherWart",
  POTATO_ITEM: "potato",
  PUMPKIN: "pumpkin",
  SUGAR_CANE: "sugarCane",
  DOUBLE_PLANT: "sunflower",
  WHEAT: "wheat",
  WILD_ROSE: "wildRose",
} as const;

export type CropBoard = (typeof CROP_BOARDS)[keyof typeof CROP_BOARDS];

const slug = (text: string) => text.toLowerCase().replaceAll(/[^\da-z]+/g, "_").replaceAll(/^_|_$/g, "");

/**
 * A board per collection item, keyed by its id (LOG:2 and LOG_2 are both logs, so only the colon changes), and per
 * bestiary family, keyed by its page and name since two pages share a family name. `scripts/sync-data.ts` writes the
 * keys for @statsify/schemas, which can't import this package.
 */
export const collectionBoards = (collections: typeof COLLECTIONS) =>
  collections.flatMap(({ items }) => items.map(({ id, name }) => ({ key: id.replace(":", "-"), id, name })));

export const bestiaryBoards = (bestiary: typeof BESTIARY) =>
  bestiary.pages.flatMap((page) =>
    page.families.map((family) => ({ key: `${slug(page.name)}_${slug(family.name)}`, name: `${family.name} (${page.name})` }))
  );

const COLLECTION_BOARDS = collectionBoards(COLLECTIONS);
const BESTIARY_BOARDS = bestiaryBoards(BESTIARY);

/** A member's numbers at a fetch, as their profile page shows them, except for what a co-op shares. */
export type MemberStats = Record<MemberStat, number> & {
  floors: Record<FloorBoard, { completions: number; fastestSPlus: number }>;
  crops: Record<CropBoard, number>;
  collections: Record<string, number>;
  bestiary: Record<string, number>;
};

// 13 bits hold the average in hundredths (60.00 at most) and 40 the XP, so the score stays an exact integer
const XP_SPAN = 2 ** 40;

/** The skill average board's score: the average as shown, to two decimals, then the averaged skills' XP. */
export const skillAverageOrder = (average: number, xp: number) =>
  Math.round(average * 100) * XP_SPAN + Math.min(Math.floor(xp), XP_SPAN - 1);

// The page counts Catacombs and class levels past 50; the boards show the game's
const cappedLevel = ({ level, maxLevel }: Level) => Math.min(level, maxLevel);

/**
 * A section left out of `view` leaves its numbers out, so a caller can keep the ones it had; a section the API settings
 * hide counts 0. What a co-op shares counts the member's own part: their own Social XP, and their share of the bank.
 */
export function toMemberStats(
  { uuid, profile, member, items, prices }: Pick<SectionInput, "uuid" | "profile" | "member" | "items" | "prices">,
  view: MemberView
): Partial<MemberStats> {
  const { bestiary, chocolate, collections, crimson, dungeons, fishing, hotm, jacob, networth, pets, skills, slayers } = view;
  const summary = toProfileSummary(profile, uuid);
  const stats: Partial<MemberStats> = { xp: summary.xp, level: summary.level, fairySouls: summary.fairySouls };

  if (networth) {
    const members = Object.keys(profile.members).filter((other) => isMember(profile, other)).length;
    const othersBank = networth.bank - networth.bank / members;
    stats.networth = networth.noInventory ? 0 : Math.floor(networth.total - othersBank);
    stats.nonCosmeticNetworth = networth.noInventory ? 0 : Math.floor(networth.nonCosmetic.total - othersBank);
    stats.unsoulboundNetworth = networth.noInventory ? 0 : Math.floor(networth.unsoulbound - othersBank);
  }

  if (skills !== undefined) {
    const averagedXp = skills ? add(...AVERAGED.map((skill) => skills.skills[skill].xp)) : 0;
    stats.skillAverage = skills?.average ?? 0;
    stats.skillAverageOrder = skillAverageOrder(stats.skillAverage, averagedXp);

    for (const skill of LEVELED_SKILLS) {
      stats[`${skill}Xp`] = Math.floor(skills?.skills[skill].xp ?? 0);
      stats[`${skill}Level`] = skills?.skills[skill].level ?? 0;
    }

    stats.socialXp = skills ? Math.floor(xpOf(member, "social")) : 0;
  }

  if (dungeons) {
    stats.catacombsXp = Math.floor(dungeons.catacombs.xp);
    stats.catacombsLevel = cappedLevel(dungeons.catacombs);

    for (const name of DUNGEON_CLASSES) {
      stats[`${name}Xp`] = Math.floor(dungeons.classes[name].xp);
      stats[`${name}Level`] = cappedLevel(dungeons.classes[name]);
    }

    stats.secrets = dungeons.secrets;

    const floor = (mode: "normal" | "master", number: number) => {
      const found = dungeons.floors[mode].find((candidate) => candidate.floor === number);
      return { completions: found?.completions ?? 0, fastestSPlus: found?.fastestSPlus ?? 0 };
    };

    stats.floors = Object.fromEntries(
      FLOOR_BOARDS.map((board) => [
        board,
        board === "entrance" ? floor("normal", 0) : floor(board.startsWith("master") ? "master" : "normal", Number(board.at(-1))),
      ])
    ) as MemberStats["floors"];
  }

  if (slayers) {
    stats.slayerXp = slayers.xp;

    for (const boss of SLAYER_BOSSES) {
      stats[`${boss}Xp`] = slayers.bosses[boss].level.xp;
      stats[`${boss}Level`] = slayers.bosses[boss].level.level;
    }
  }

  if (crimson !== undefined) {
    for (const tier of KUUDRA_TIERS) {
      stats[KUUDRA_STATS[tier]] = crimson?.kuudra.find((kuudra) => kuudra.tier === tier)?.completions ?? 0;
    }

    stats.magesReputation = crimson?.reputation.mages ?? 0;
    stats.barbariansReputation = crimson?.reputation.barbarians ?? 0;
  }

  if (hotm) {
    stats.hotmXp = Math.floor(hotm.level.xp);
    stats.hotmLevel = hotm.level.level;
    for (const powder of POWDERS) stats[`${powder}Powder`] = hotm.powder[powder].total;
  }

  // The bag alone, without the accessories section's stored items and upgrades. It waits for prices as that section
  // does, so the board and the page agree
  if (items && prices) stats.accessoryPower = bagAccessories(member, items)?.accessoryPower ?? 0;
  if (pets) stats.petScore = pets.score;
  if (fishing !== undefined) stats.trophyFish = fishing?.trophyFishCaught ?? 0;
  if (chocolate !== undefined) stats.chocolate = chocolate?.total ?? 0;

  if (jacob !== undefined) {
    const bests = new Map(jacob?.crops.map(({ id, personalBest }) => [id, personalBest ?? 0]));
    stats.crops = Object.fromEntries(
      Object.entries(CROP_BOARDS).map(([id, board]) => [board, bests.get(id) ?? 0])
    ) as MemberStats["crops"];
  }

  // The member's own part of each co-op collection; 0 with the Collections API off
  if (collections !== undefined) {
    const amounts = new Map(
      collections?.categories.flatMap(({ items }) =>
        items.map(({ id, members }) => [id, members.find((part) => part.uuid === uuid)?.amount ?? 0] as const)
      )
    );
    stats.collections = Object.fromEntries(COLLECTION_BOARDS.map(({ key, id }) => [key, amounts.get(id) ?? 0]));
  }

  if (bestiary) {
    const kills = bestiary.pages.flatMap(({ families }) => families.map(({ kills }) => kills));
    stats.bestiary = Object.fromEntries(BESTIARY_BOARDS.map(({ key }, index) => [key, kills[index] ?? 0]));
  }

  stats.kills = member.player_stats?.kills?.total ?? 0;

  return stats;
}

if (import.meta.vitest) {
  const { test, expect } = import.meta.vitest;

  test("skillAverageOrder ranks by the shown average, then by the XP under it", () => {
    expect(skillAverageOrder(55.7, 0)).toBeGreaterThan(skillAverageOrder(55.69, 1e11));
    expect(skillAverageOrder(55.704, 2)).toBeGreaterThan(skillAverageOrder(55.696, 1));
    expect(skillAverageOrder(55.7, 1e13)).toBe(skillAverageOrder(55.7, 2 ** 40));
    expect(Number.isSafeInteger(skillAverageOrder(60, 1e13))).toBe(true);
  });
}
