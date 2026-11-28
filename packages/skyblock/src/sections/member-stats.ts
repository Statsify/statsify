/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { AVERAGED, SKILLS, type Skill, getSkillXp } from "./skills.js";
import { COLLECTIONS } from "#data";
import { DUNGEON_CLASSES, type DungeonClass } from "./dungeons.js";
import { KUUDRA_TIERS, type Level, type MemberView } from "#types";
import { POWDERS, type Powder } from "./hotm.js";
import { SLAYER_BOSSES, type SlayerBoss } from "./slayers.js";
import { add } from "@statsify/math";
import { isMember, toProfileSummary } from "../profiles.js";
import { readBag } from "./accessories.js";
import type { Faction } from "./crimson.js";
import type { SectionInput, SkyBlockSection } from "./index.js";

// The level and fairy souls come from the profile summary instead.
export const MEMBER_STATS_SECTIONS: SkyBlockSection[] = [
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
];

const KUUDRA_STATS = {
  none: "kuudraBasic",
  hot: "kuudraHot",
  burning: "kuudraBurning",
  fiery: "kuudraFiery",
  infernal: "kuudraInfernal",
} as const satisfies Record<(typeof KUUDRA_TIERS)[number], string>;

// The page's Social is the co-op's, so its board ranks the member's own XP.
type LeveledSkill = Exclude<Skill, "social">;
const LEVELED_SKILLS = SKILLS.filter(
  (skill): skill is LeveledSkill => skill !== "social",
);

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
  | "accessoryPower"
  | "petScore"
  | "fairySouls"
  | "trophyFish"
  | "chocolate";

const FLOOR_BOARDS = [
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

type FloorBoard = (typeof FLOOR_BOARDS)[number];

// Jacob's contests name each crop by these item ids.
const CROP_BOARDS = {
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

type CropBoard = (typeof CROP_BOARDS)[keyof typeof CROP_BOARDS];

// LOG:2 and LOG_2 are both logs, so the key changes only the colon.
export const getCollectionBoards = (
  collections: { items: { id: string; name: string }[] }[],
) =>
  collections.flatMap(({ items }) =>
    items.map(({ id, name }) => ({ key: id.replace(":", "-"), id, name })),
  );

const toSlug = (text: string) =>
  text
    .toLowerCase()
    .replaceAll(/[^\da-z]+/g, "_")
    .replaceAll(/^_|_$/g, "");

// Two bestiary pages can share a family name, so the key has the page too.
const getBestiaryKey = (page: string, family: string) =>
  `${toSlug(page)}_${toSlug(family)}`;

export const getBestiaryBoards = (bestiary: {
  pages: { name: string; families: { name: string }[] }[];
}) =>
  bestiary.pages.flatMap((page) =>
    page.families.map((family) => ({
      key: getBestiaryKey(page.name, family.name),
      name: `${family.name} (${page.name})`,
    })),
  );

const COLLECTION_BOARDS = getCollectionBoards(COLLECTIONS);

export type MemberStats = Record<MemberStat, number> & {
  floors: Record<FloorBoard, { completions: number; fastestSPlus: number }>;
  crops: Record<CropBoard, number>;
  collections: Record<string, number>;
  bestiary: Record<string, number>;
};

// 13 bits hold hundredths of an average up to 60, and 40 bits the XP.
const XP_SPAN = 2 ** 40;

// Maxed members tie on the shown average, so the XP under it breaks ties.
const getSkillAverageOrder = (average: number, xp: number) =>
  Math.round(average * 100) * XP_SPAN + Math.min(Math.floor(xp), XP_SPAN - 1);

// The page counts Catacombs and class levels past 50, but the boards don't.
const getCappedLevel = ({ level, maxLevel }: Level) =>
  Math.min(level, maxLevel);

// A section left out of the view leaves its stats out, so stored ones stay.
export function toMemberStats(
  {
    uuid,
    profile,
    member,
    items,
    prices,
  }: Pick<SectionInput, "uuid" | "profile" | "member" | "items" | "prices">,
  view: MemberView,
): Partial<MemberStats> {
  const {
    bestiary,
    chocolate,
    collections,
    crimson,
    dungeons,
    fishing,
    hotm,
    jacob,
    networth,
    pets,
    skills,
    slayers,
  } = view;
  const summary = toProfileSummary(profile, uuid);
  const stats: Partial<MemberStats> = {
    xp: summary.xp,
    level: summary.level,
    fairySouls: summary.fairySouls,
  };

  if (networth) {
    const members = Object.keys(profile.members).filter((other) =>
      isMember(profile, other),
    ).length;
    // The bank is the co-op's, so a member's networth counts only their share.
    const othersBank = networth.bank - networth.bank / members;
    stats.networth = networth.noInventory
      ? 0
      : Math.floor(networth.total - othersBank);
    stats.nonCosmeticNetworth = networth.noInventory
      ? 0
      : Math.floor(networth.nonCosmetic.total - othersBank);
    stats.unsoulboundNetworth = networth.noInventory
      ? 0
      : Math.floor(networth.unsoulbound - othersBank);
  }

  if (skills !== undefined) {
    const averagedXp = skills
      ? add(...AVERAGED.map((skill) => skills.skills[skill].xp))
      : 0;
    stats.skillAverage = skills?.average ?? 0;
    stats.skillAverageOrder = getSkillAverageOrder(
      stats.skillAverage,
      averagedXp,
    );

    for (const skill of LEVELED_SKILLS) {
      stats[`${skill}Xp`] = Math.floor(skills?.skills[skill].xp ?? 0);
      stats[`${skill}Level`] = skills?.skills[skill].level ?? 0;
    }

    stats.socialXp = skills ? Math.floor(getSkillXp(member, "social")) : 0;
  }

  if (dungeons) {
    stats.catacombsXp = Math.floor(dungeons.catacombs.xp);
    stats.catacombsLevel = getCappedLevel(dungeons.catacombs);

    for (const name of DUNGEON_CLASSES) {
      stats[`${name}Xp`] = Math.floor(dungeons.classes[name].xp);
      stats[`${name}Level`] = getCappedLevel(dungeons.classes[name]);
    }

    stats.secrets = dungeons.secrets;

    const floors = [...dungeons.floors.normal, ...dungeons.floors.master];
    stats.floors = Object.fromEntries(
      FLOOR_BOARDS.map((board, index) => [
        board,
        {
          completions: floors[index].completions,
          fastestSPlus: floors[index].fastestSPlus ?? 0,
        },
      ]),
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
      const kuudra = crimson?.kuudra.find((entry) => entry.tier === tier);
      stats[KUUDRA_STATS[tier]] = kuudra?.completions ?? 0;
    }

    stats.magesReputation = crimson?.reputation.mages ?? 0;
    stats.barbariansReputation = crimson?.reputation.barbarians ?? 0;
  }

  if (hotm) {
    stats.hotmXp = Math.floor(hotm.level.xp);
    stats.hotmLevel = hotm.level.level;
    for (const powder of POWDERS) {
      stats[`${powder}Powder`] = hotm.powder[powder].total;
    }
  }

  // It waits for prices like the accessories section, so the two agree.
  if (items && prices) {
    stats.accessoryPower = readBag(member, items)?.accessoryPower ?? 0;
  }

  if (pets) stats.petScore = pets.score;
  if (fishing !== undefined) stats.trophyFish = fishing?.trophyFishCaught ?? 0;
  if (chocolate !== undefined) stats.chocolate = chocolate?.total ?? 0;

  if (jacob !== undefined) {
    const bests = new Map(
      jacob?.crops.map(({ id, personalBest }) => [id, personalBest ?? 0]),
    );
    stats.crops = Object.fromEntries(
      Object.entries(CROP_BOARDS).map(([id, board]) => [
        board,
        bests.get(id) ?? 0,
      ]),
    ) as MemberStats["crops"];
  }

  // A member's part of a co-op collection, or 0 with the Collections API off.
  if (collections !== undefined) {
    const amounts = new Map<string, number>();
    for (const { items } of collections?.categories ?? []) {
      for (const { id, members } of items) {
        const part = members.find((member) => member.uuid === uuid);
        amounts.set(id, part?.amount ?? 0);
      }
    }

    stats.collections = Object.fromEntries(
      COLLECTION_BOARDS.map(({ key, id }) => [key, amounts.get(id) ?? 0]),
    );
  }

  if (bestiary) {
    stats.bestiary = Object.fromEntries(
      bestiary.pages.flatMap((page) =>
        page.families.map(({ name, kills }) => [
          getBestiaryKey(page.name, name),
          kills,
        ]),
      ),
    );
  }

  return stats;
}

if (import.meta.vitest) {
  const { suite, it, expect } = import.meta.vitest;

  suite("getSkillAverageOrder", () => {
    it("should rank by the shown average first", () => {
      expect(getSkillAverageOrder(55.7, 0)).toBeGreaterThan(
        getSkillAverageOrder(55.69, 1e11),
      );
      expect(getSkillAverageOrder(55.704, 2)).toBeGreaterThan(
        getSkillAverageOrder(55.696, 1),
      );
    });

    it("should cap the XP so the score stays an exact integer", () => {
      expect(getSkillAverageOrder(55.7, 1e13)).toBe(
        getSkillAverageOrder(55.7, 2 ** 40),
      );
      expect(Number.isSafeInteger(getSkillAverageOrder(60, 1e13))).toBe(true);
    });
  });
}
