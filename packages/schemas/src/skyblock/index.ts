/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import boards from "./boards.json" with { type: "json" };
import { Field } from "#metadata";
import { FormattedGame } from "#game";
import { formatTime } from "@statsify/util";
import { modelOptions as ModelOptions } from "@typegoose/typegoose";

// The default limits are sized for player boards, so each board sets its own.
const BOARD_LIMIT = 50_000;
// There are hundreds of these boards, so each keeps a shallower depth.
const COLLECTION_BOARD_LIMIT = 5_000;
const BESTIARY_BOARD_LIMIT = 1_000;

export class SkyBlockFloorBoards {
  @Field({ leaderboard: { limit: BOARD_LIMIT } })
  public completions: number;

  @Field({
    leaderboard: {
      fieldName: "Fastest S+",
      formatter: formatTime,
      sort: "ASC",
      limit: BOARD_LIMIT,
    },
  })
  public fastestSPlus: number;
}

export class SkyBlockFloorsBoards {
  @Field()
  public entrance: SkyBlockFloorBoards;

  @Field({ leaderboard: { name: "Floor 1" } })
  public floor1: SkyBlockFloorBoards;

  @Field({ leaderboard: { name: "Floor 2" } })
  public floor2: SkyBlockFloorBoards;

  @Field({ leaderboard: { name: "Floor 3" } })
  public floor3: SkyBlockFloorBoards;

  @Field({ leaderboard: { name: "Floor 4" } })
  public floor4: SkyBlockFloorBoards;

  @Field({ leaderboard: { name: "Floor 5" } })
  public floor5: SkyBlockFloorBoards;

  @Field({ leaderboard: { name: "Floor 6" } })
  public floor6: SkyBlockFloorBoards;

  @Field({ leaderboard: { name: "Floor 7" } })
  public floor7: SkyBlockFloorBoards;

  @Field({ leaderboard: { name: "Master Mode Floor 1" } })
  public master1: SkyBlockFloorBoards;

  @Field({ leaderboard: { name: "Master Mode Floor 2" } })
  public master2: SkyBlockFloorBoards;

  @Field({ leaderboard: { name: "Master Mode Floor 3" } })
  public master3: SkyBlockFloorBoards;

  @Field({ leaderboard: { name: "Master Mode Floor 4" } })
  public master4: SkyBlockFloorBoards;

  @Field({ leaderboard: { name: "Master Mode Floor 5" } })
  public master5: SkyBlockFloorBoards;

  @Field({ leaderboard: { name: "Master Mode Floor 6" } })
  public master6: SkyBlockFloorBoards;

  @Field({ leaderboard: { name: "Master Mode Floor 7" } })
  public master7: SkyBlockFloorBoards;
}

// Each crop's board ranks the member's best Jacob's contest.
export class SkyBlockCropBoards {
  @Field({ leaderboard: { limit: BOARD_LIMIT } })
  public cactus: number;

  @Field({ leaderboard: { limit: BOARD_LIMIT } })
  public carrot: number;

  @Field({ leaderboard: { limit: BOARD_LIMIT } })
  public cocoaBeans: number;

  @Field({ leaderboard: { limit: BOARD_LIMIT } })
  public melon: number;

  @Field({ leaderboard: { limit: BOARD_LIMIT } })
  public moonflower: number;

  @Field({ leaderboard: { limit: BOARD_LIMIT } })
  public mushroom: number;

  @Field({ leaderboard: { limit: BOARD_LIMIT } })
  public netherWart: number;

  @Field({ leaderboard: { limit: BOARD_LIMIT } })
  public potato: number;

  @Field({ leaderboard: { limit: BOARD_LIMIT } })
  public pumpkin: number;

  @Field({ leaderboard: { limit: BOARD_LIMIT } })
  public sugarCane: number;

  @Field({ leaderboard: { limit: BOARD_LIMIT } })
  public sunflower: number;

  @Field({ leaderboard: { limit: BOARD_LIMIT } })
  public wheat: number;

  @Field({ leaderboard: { limit: BOARD_LIMIT } })
  public wildRose: number;
}

// sync-data writes boards.json, since schemas can't import @statsify/skyblock.
export class SkyBlockCollectionBoards {
  [key: string]: number;
}

export class SkyBlockBestiaryBoards {
  [key: string]: number;
}

for (const [key, name] of boards.collections) {
  Field({
    type: () => Number,
    leaderboard: {
      name,
      fieldName: "Collected",
      limit: COLLECTION_BOARD_LIMIT,
    },
  })(SkyBlockCollectionBoards.prototype, key);
}

for (const [key, name] of boards.bestiary) {
  Field({
    type: () => Number,
    leaderboard: { name, fieldName: "Kills", limit: BESTIARY_BOARD_LIMIT },
  })(SkyBlockBestiaryBoards.prototype, key);
}

export class SkyBlockBoards {
  @Field({
    leaderboard: {
      fieldName: "Level",
      hidden: true,
      additionalFields: ["this.level"],
      limit: BOARD_LIMIT,
    },
  })
  public xp: number;

  @Field({ leaderboard: { enabled: false } })
  public level: number;

  @Field({ leaderboard: { limit: BOARD_LIMIT } })
  public networth: number;

  @Field({
    leaderboard: { fieldName: "Non-Cosmetic Networth", limit: BOARD_LIMIT },
  })
  public nonCosmeticNetworth: number;

  // Maxed members tie on the average, so the board ranks skillAverageOrder.
  @Field({
    leaderboard: {
      fieldName: "Skill Average",
      hidden: true,
      additionalFields: ["this.skillAverage"],
      limit: BOARD_LIMIT,
    },
  })
  public skillAverageOrder: number;

  @Field({ leaderboard: { enabled: false } })
  public skillAverage: number;

  @Field({
    leaderboard: {
      fieldName: "Farming XP",
      additionalFields: ["this.farmingLevel"],
      limit: BOARD_LIMIT,
    },
  })
  public farmingXp: number;

  @Field({ leaderboard: { enabled: false, fieldName: "Level" } })
  public farmingLevel: number;

  @Field({
    leaderboard: {
      fieldName: "Mining XP",
      additionalFields: ["this.miningLevel"],
      limit: BOARD_LIMIT,
    },
  })
  public miningXp: number;

  @Field({ leaderboard: { enabled: false, fieldName: "Level" } })
  public miningLevel: number;

  @Field({
    leaderboard: {
      fieldName: "Combat XP",
      additionalFields: ["this.combatLevel"],
      limit: BOARD_LIMIT,
    },
  })
  public combatXp: number;

  @Field({ leaderboard: { enabled: false, fieldName: "Level" } })
  public combatLevel: number;

  @Field({
    leaderboard: {
      fieldName: "Foraging XP",
      additionalFields: ["this.foragingLevel"],
      limit: BOARD_LIMIT,
    },
  })
  public foragingXp: number;

  @Field({ leaderboard: { enabled: false, fieldName: "Level" } })
  public foragingLevel: number;

  @Field({
    leaderboard: {
      fieldName: "Fishing XP",
      additionalFields: ["this.fishingLevel"],
      limit: BOARD_LIMIT,
    },
  })
  public fishingXp: number;

  @Field({ leaderboard: { enabled: false, fieldName: "Level" } })
  public fishingLevel: number;

  @Field({
    leaderboard: {
      fieldName: "Enchanting XP",
      additionalFields: ["this.enchantingLevel"],
      limit: BOARD_LIMIT,
    },
  })
  public enchantingXp: number;

  @Field({ leaderboard: { enabled: false, fieldName: "Level" } })
  public enchantingLevel: number;

  @Field({
    leaderboard: {
      fieldName: "Alchemy XP",
      additionalFields: ["this.alchemyLevel"],
      limit: BOARD_LIMIT,
    },
  })
  public alchemyXp: number;

  @Field({ leaderboard: { enabled: false, fieldName: "Level" } })
  public alchemyLevel: number;

  @Field({
    leaderboard: {
      fieldName: "Taming XP",
      additionalFields: ["this.tamingLevel"],
      limit: BOARD_LIMIT,
    },
  })
  public tamingXp: number;

  @Field({ leaderboard: { enabled: false, fieldName: "Level" } })
  public tamingLevel: number;

  @Field({
    leaderboard: {
      fieldName: "Carpentry XP",
      additionalFields: ["this.carpentryLevel"],
      limit: BOARD_LIMIT,
    },
  })
  public carpentryXp: number;

  @Field({ leaderboard: { enabled: false, fieldName: "Level" } })
  public carpentryLevel: number;

  @Field({
    leaderboard: {
      fieldName: "Hunting XP",
      additionalFields: ["this.huntingLevel"],
      limit: BOARD_LIMIT,
    },
  })
  public huntingXp: number;

  @Field({ leaderboard: { enabled: false, fieldName: "Level" } })
  public huntingLevel: number;

  @Field({
    leaderboard: {
      fieldName: "Runecrafting XP",
      additionalFields: ["this.runecraftingLevel"],
      limit: BOARD_LIMIT,
    },
  })
  public runecraftingXp: number;

  @Field({ leaderboard: { enabled: false, fieldName: "Level" } })
  public runecraftingLevel: number;

  @Field({ leaderboard: { fieldName: "Social XP", limit: BOARD_LIMIT } })
  public socialXp: number;

  @Field({
    leaderboard: {
      fieldName: "Catacombs XP",
      additionalFields: ["this.catacombsLevel"],
      limit: BOARD_LIMIT,
    },
  })
  public catacombsXp: number;

  @Field({ leaderboard: { enabled: false, fieldName: "Level" } })
  public catacombsLevel: number;

  @Field({
    leaderboard: {
      fieldName: "Healer XP",
      additionalFields: ["this.healerLevel"],
      limit: BOARD_LIMIT,
    },
  })
  public healerXp: number;

  @Field({ leaderboard: { enabled: false, fieldName: "Level" } })
  public healerLevel: number;

  @Field({
    leaderboard: {
      fieldName: "Mage XP",
      additionalFields: ["this.mageLevel"],
      limit: BOARD_LIMIT,
    },
  })
  public mageXp: number;

  @Field({ leaderboard: { enabled: false, fieldName: "Level" } })
  public mageLevel: number;

  @Field({
    leaderboard: {
      fieldName: "Berserk XP",
      additionalFields: ["this.berserkLevel"],
      limit: BOARD_LIMIT,
    },
  })
  public berserkXp: number;

  @Field({ leaderboard: { enabled: false, fieldName: "Level" } })
  public berserkLevel: number;

  @Field({
    leaderboard: {
      fieldName: "Archer XP",
      additionalFields: ["this.archerLevel"],
      limit: BOARD_LIMIT,
    },
  })
  public archerXp: number;

  @Field({ leaderboard: { enabled: false, fieldName: "Level" } })
  public archerLevel: number;

  @Field({
    leaderboard: {
      fieldName: "Tank XP",
      additionalFields: ["this.tankLevel"],
      limit: BOARD_LIMIT,
    },
  })
  public tankXp: number;

  @Field({ leaderboard: { enabled: false, fieldName: "Level" } })
  public tankLevel: number;

  @Field({ leaderboard: { limit: BOARD_LIMIT } })
  public secrets: number;

  @Field({ leaderboard: { fieldName: "Slayer XP", limit: BOARD_LIMIT } })
  public slayerXp: number;

  @Field({
    leaderboard: {
      fieldName: "Zombie Slayer XP",
      additionalFields: ["this.zombieLevel"],
      limit: BOARD_LIMIT,
    },
  })
  public zombieXp: number;

  @Field({ leaderboard: { enabled: false, fieldName: "Level" } })
  public zombieLevel: number;

  @Field({
    leaderboard: {
      fieldName: "Spider Slayer XP",
      additionalFields: ["this.spiderLevel"],
      limit: BOARD_LIMIT,
    },
  })
  public spiderXp: number;

  @Field({ leaderboard: { enabled: false, fieldName: "Level" } })
  public spiderLevel: number;

  @Field({
    leaderboard: {
      fieldName: "Wolf Slayer XP",
      additionalFields: ["this.wolfLevel"],
      limit: BOARD_LIMIT,
    },
  })
  public wolfXp: number;

  @Field({ leaderboard: { enabled: false, fieldName: "Level" } })
  public wolfLevel: number;

  @Field({
    leaderboard: {
      fieldName: "Enderman Slayer XP",
      additionalFields: ["this.endermanLevel"],
      limit: BOARD_LIMIT,
    },
  })
  public endermanXp: number;

  @Field({ leaderboard: { enabled: false, fieldName: "Level" } })
  public endermanLevel: number;

  @Field({
    leaderboard: {
      fieldName: "Blaze Slayer XP",
      additionalFields: ["this.blazeLevel"],
      limit: BOARD_LIMIT,
    },
  })
  public blazeXp: number;

  @Field({ leaderboard: { enabled: false, fieldName: "Level" } })
  public blazeLevel: number;

  @Field({
    leaderboard: {
      fieldName: "Vampire Slayer XP",
      additionalFields: ["this.vampireLevel"],
      limit: BOARD_LIMIT,
    },
  })
  public vampireXp: number;

  @Field({ leaderboard: { enabled: false, fieldName: "Level" } })
  public vampireLevel: number;

  @Field({
    leaderboard: {
      fieldName: "Completions",
      name: "Basic Kuudra Completions",
      limit: BOARD_LIMIT,
    },
  })
  public kuudraBasic: number;

  @Field({
    leaderboard: {
      fieldName: "Completions",
      name: "Hot Kuudra Completions",
      limit: BOARD_LIMIT,
    },
  })
  public kuudraHot: number;

  @Field({
    leaderboard: {
      fieldName: "Completions",
      name: "Burning Kuudra Completions",
      limit: BOARD_LIMIT,
    },
  })
  public kuudraBurning: number;

  @Field({
    leaderboard: {
      fieldName: "Completions",
      name: "Fiery Kuudra Completions",
      limit: BOARD_LIMIT,
    },
  })
  public kuudraFiery: number;

  @Field({
    leaderboard: {
      fieldName: "Completions",
      name: "Infernal Kuudra Completions",
      limit: BOARD_LIMIT,
    },
  })
  public kuudraInfernal: number;

  @Field({
    leaderboard: {
      fieldName: "HOTM XP",
      additionalFields: ["this.hotmLevel"],
      limit: BOARD_LIMIT,
    },
  })
  public hotmXp: number;

  @Field({ leaderboard: { enabled: false, fieldName: "Level" } })
  public hotmLevel: number;

  @Field({ leaderboard: { limit: BOARD_LIMIT } })
  public accessoryPower: number;

  @Field({ leaderboard: { limit: BOARD_LIMIT } })
  public petScore: number;

  @Field({ leaderboard: { limit: BOARD_LIMIT } })
  public fairySouls: number;

  @Field({
    leaderboard: { fieldName: "Trophy Fish Caught", limit: BOARD_LIMIT },
  })
  public trophyFish: number;

  @Field({
    leaderboard: { fieldName: "All-Time Chocolate", limit: BOARD_LIMIT },
  })
  public chocolate: number;

  @Field({ leaderboard: { limit: BOARD_LIMIT } })
  public unsoulboundNetworth: number;

  @Field({ leaderboard: { limit: BOARD_LIMIT } })
  public mithrilPowder: number;

  @Field({ leaderboard: { limit: BOARD_LIMIT } })
  public gemstonePowder: number;

  @Field({ leaderboard: { limit: BOARD_LIMIT } })
  public glacitePowder: number;

  @Field({ leaderboard: { fieldName: "Mage Reputation", limit: BOARD_LIMIT } })
  public magesReputation: number;

  @Field({
    leaderboard: { fieldName: "Barbarian Reputation", limit: BOARD_LIMIT },
  })
  public barbariansReputation: number;

  @Field({ leaderboard: { name: "" } })
  public floors: SkyBlockFloorsBoards;

  @Field({ leaderboard: { name: "Contest Best" } })
  public crops: SkyBlockCropBoards;

  @Field({ leaderboard: { name: "Collection" } })
  public collections: SkyBlockCollectionBoards;

  @Field()
  public bestiary: SkyBlockBestiaryBoards;
}

export const SKYBLOCK_BOARD_MODES = [
  "overall",
  "ironman",
  "stranded",
  "bingo",
] as const;

export interface SkyBlockStatsRow {
  uuid: string;
  profileId: string;
  cuteName: string;
  gameMode: "normal" | "ironman" | "stranded" | "bingo";
  fetchedAt: number;
  networthAsOf?: number;
  boards: Partial<SkyBlockBoards>;
}

export const skyblockStatsId = (uuid: string, profileId: string) =>
  `${uuid}:${profileId}`;
export const skyblockStatsUuid = (id: string) => id.split(":")[0];

@ModelOptions({
  schemaOptions: { collection: "skyblockstats", versionKey: false },
})
export class SkyBlockStats {
  @Field({ mongo: { index: true, unique: true }, store: { required: true } })
  public id: string;

  @Field({ mongo: { index: true }, store: { required: true } })
  public uuid: string;

  @Field({ store: { required: true } })
  public profileId: string;

  @Field()
  public cuteName: string;

  @Field({ type: () => String })
  public gameMode: SkyBlockStatsRow["gameMode"];

  @Field({ leaderboard: { enabled: false } })
  public fetchedAt: number;

  @Field({ leaderboard: { enabled: false }, store: { required: false } })
  public networthAsOf?: number;

  @Field({ leaderboard: { name: FormattedGame.SKYBLOCK } })
  public overall: SkyBlockBoards;

  @Field({ leaderboard: { name: `${FormattedGame.SKYBLOCK} Ironman` } })
  public ironman: SkyBlockBoards;

  @Field({ leaderboard: { name: `${FormattedGame.SKYBLOCK} Stranded` } })
  public stranded: SkyBlockBoards;

  @Field({ leaderboard: { name: `${FormattedGame.SKYBLOCK} Bingo` } })
  public bingo: SkyBlockBoards;

  public constructor(row?: SkyBlockStatsRow) {
    if (!row) return;

    this.id = skyblockStatsId(row.uuid, row.profileId);
    this.uuid = row.uuid;
    this.profileId = row.profileId;
    this.cuteName = row.cuteName;
    this.gameMode = row.gameMode;
    this.fetchedAt = row.fetchedAt;
    this.networthAsOf = row.networthAsOf;

    for (const mode of SKYBLOCK_BOARD_MODES) {
      const ranked = mode === "overall" || mode === row.gameMode;
      this[mode] = Object.assign(
        new SkyBlockBoards(),
        ranked ? row.boards : {},
      );
    }
  }
}
