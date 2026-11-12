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

export class SkyBlockFloorBoards {
  @Field()
  public completions: number;

  @Field({ leaderboard: { fieldName: "Fastest S+", formatter: formatTime, sort: "ASC" } })
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

/** Jacob's contest personal best per crop. */
export class SkyBlockCropBoards {
  @Field()
  public cactus: number;

  @Field()
  public carrot: number;

  @Field()
  public cocoaBeans: number;

  @Field()
  public melon: number;

  @Field()
  public moonflower: number;

  @Field()
  public mushroom: number;

  @Field()
  public netherWart: number;

  @Field()
  public potato: number;

  @Field()
  public pumpkin: number;

  @Field()
  public sugarCane: number;

  @Field()
  public sunflower: number;

  @Field()
  public wheat: number;

  @Field()
  public wildRose: number;
}

/**
 * Keyed as `boards.json` lists them, which @statsify/skyblock's sync-data writes since schemas can't import it. Hundreds
 * of boards, so each keeps a shallower depth than the main ones.
 */
export class SkyBlockCollectionBoards {
  [key: string]: number;
}

export class SkyBlockBestiaryBoards {
  [key: string]: number;
}

for (const [key, name] of boards.collections) {
  Field({ type: () => Number, leaderboard: { name, fieldName: "Collected", limit: 5000 } })(SkyBlockCollectionBoards.prototype, key);
}

for (const [key, name] of boards.bestiary) {
  Field({ type: () => Number, leaderboard: { name, fieldName: "Kills", limit: 1000 } })(SkyBlockBestiaryBoards.prototype, key);
}

/** One mode's boards for a member of a profile, from `toMemberStats` in `@statsify/skyblock`. */
export class SkyBlockBoards {
  @Field({ leaderboard: { fieldName: "Level", hidden: true, additionalFields: ["this.level"] } })
  public xp: number;

  @Field({ leaderboard: { enabled: false } })
  public level: number;

  @Field()
  public networth: number;

  @Field({ leaderboard: { fieldName: "Non-Cosmetic Networth" } })
  public nonCosmeticNetworth: number;

  // Maxed members tie on the average, so the board ranks by `skillAverageOrder` (the shown average, then the XP under it)
  @Field({ leaderboard: { fieldName: "Skill Average", hidden: true, additionalFields: ["this.skillAverage"] } })
  public skillAverageOrder: number;

  @Field({ leaderboard: { enabled: false } })
  public skillAverage: number;

  @Field({ leaderboard: { fieldName: "Farming XP", additionalFields: ["this.farmingLevel"] } })
  public farmingXp: number;

  @Field({ leaderboard: { enabled: false, fieldName: "Level" } })
  public farmingLevel: number;

  @Field({ leaderboard: { fieldName: "Mining XP", additionalFields: ["this.miningLevel"] } })
  public miningXp: number;

  @Field({ leaderboard: { enabled: false, fieldName: "Level" } })
  public miningLevel: number;

  @Field({ leaderboard: { fieldName: "Combat XP", additionalFields: ["this.combatLevel"] } })
  public combatXp: number;

  @Field({ leaderboard: { enabled: false, fieldName: "Level" } })
  public combatLevel: number;

  @Field({ leaderboard: { fieldName: "Foraging XP", additionalFields: ["this.foragingLevel"] } })
  public foragingXp: number;

  @Field({ leaderboard: { enabled: false, fieldName: "Level" } })
  public foragingLevel: number;

  @Field({ leaderboard: { fieldName: "Fishing XP", additionalFields: ["this.fishingLevel"] } })
  public fishingXp: number;

  @Field({ leaderboard: { enabled: false, fieldName: "Level" } })
  public fishingLevel: number;

  @Field({ leaderboard: { fieldName: "Enchanting XP", additionalFields: ["this.enchantingLevel"] } })
  public enchantingXp: number;

  @Field({ leaderboard: { enabled: false, fieldName: "Level" } })
  public enchantingLevel: number;

  @Field({ leaderboard: { fieldName: "Alchemy XP", additionalFields: ["this.alchemyLevel"] } })
  public alchemyXp: number;

  @Field({ leaderboard: { enabled: false, fieldName: "Level" } })
  public alchemyLevel: number;

  @Field({ leaderboard: { fieldName: "Taming XP", additionalFields: ["this.tamingLevel"] } })
  public tamingXp: number;

  @Field({ leaderboard: { enabled: false, fieldName: "Level" } })
  public tamingLevel: number;

  @Field({ leaderboard: { fieldName: "Carpentry XP", additionalFields: ["this.carpentryLevel"] } })
  public carpentryXp: number;

  @Field({ leaderboard: { enabled: false, fieldName: "Level" } })
  public carpentryLevel: number;

  @Field({ leaderboard: { fieldName: "Hunting XP", additionalFields: ["this.huntingLevel"] } })
  public huntingXp: number;

  @Field({ leaderboard: { enabled: false, fieldName: "Level" } })
  public huntingLevel: number;

  @Field({ leaderboard: { fieldName: "Runecrafting XP", additionalFields: ["this.runecraftingLevel"] } })
  public runecraftingXp: number;

  @Field({ leaderboard: { enabled: false, fieldName: "Level" } })
  public runecraftingLevel: number;

  @Field({ leaderboard: { fieldName: "Social XP" } })
  public socialXp: number;

  @Field({ leaderboard: { fieldName: "Catacombs XP", additionalFields: ["this.catacombsLevel"] } })
  public catacombsXp: number;

  @Field({ leaderboard: { enabled: false, fieldName: "Level" } })
  public catacombsLevel: number;

  @Field({ leaderboard: { fieldName: "Healer XP", additionalFields: ["this.healerLevel"] } })
  public healerXp: number;

  @Field({ leaderboard: { enabled: false, fieldName: "Level" } })
  public healerLevel: number;

  @Field({ leaderboard: { fieldName: "Mage XP", additionalFields: ["this.mageLevel"] } })
  public mageXp: number;

  @Field({ leaderboard: { enabled: false, fieldName: "Level" } })
  public mageLevel: number;

  @Field({ leaderboard: { fieldName: "Berserk XP", additionalFields: ["this.berserkLevel"] } })
  public berserkXp: number;

  @Field({ leaderboard: { enabled: false, fieldName: "Level" } })
  public berserkLevel: number;

  @Field({ leaderboard: { fieldName: "Archer XP", additionalFields: ["this.archerLevel"] } })
  public archerXp: number;

  @Field({ leaderboard: { enabled: false, fieldName: "Level" } })
  public archerLevel: number;

  @Field({ leaderboard: { fieldName: "Tank XP", additionalFields: ["this.tankLevel"] } })
  public tankXp: number;

  @Field({ leaderboard: { enabled: false, fieldName: "Level" } })
  public tankLevel: number;

  @Field()
  public secrets: number;

  @Field({ leaderboard: { fieldName: "Slayer XP" } })
  public slayerXp: number;

  @Field({ leaderboard: { fieldName: "Zombie Slayer XP", additionalFields: ["this.zombieLevel"] } })
  public zombieXp: number;

  @Field({ leaderboard: { enabled: false, fieldName: "Level" } })
  public zombieLevel: number;

  @Field({ leaderboard: { fieldName: "Spider Slayer XP", additionalFields: ["this.spiderLevel"] } })
  public spiderXp: number;

  @Field({ leaderboard: { enabled: false, fieldName: "Level" } })
  public spiderLevel: number;

  @Field({ leaderboard: { fieldName: "Wolf Slayer XP", additionalFields: ["this.wolfLevel"] } })
  public wolfXp: number;

  @Field({ leaderboard: { enabled: false, fieldName: "Level" } })
  public wolfLevel: number;

  @Field({ leaderboard: { fieldName: "Enderman Slayer XP", additionalFields: ["this.endermanLevel"] } })
  public endermanXp: number;

  @Field({ leaderboard: { enabled: false, fieldName: "Level" } })
  public endermanLevel: number;

  @Field({ leaderboard: { fieldName: "Blaze Slayer XP", additionalFields: ["this.blazeLevel"] } })
  public blazeXp: number;

  @Field({ leaderboard: { enabled: false, fieldName: "Level" } })
  public blazeLevel: number;

  @Field({ leaderboard: { fieldName: "Vampire Slayer XP", additionalFields: ["this.vampireLevel"] } })
  public vampireXp: number;

  @Field({ leaderboard: { enabled: false, fieldName: "Level" } })
  public vampireLevel: number;

  @Field({ leaderboard: { fieldName: "Completions", name: "Basic Kuudra Completions" } })
  public kuudraBasic: number;

  @Field({ leaderboard: { fieldName: "Completions", name: "Hot Kuudra Completions" } })
  public kuudraHot: number;

  @Field({ leaderboard: { fieldName: "Completions", name: "Burning Kuudra Completions" } })
  public kuudraBurning: number;

  @Field({ leaderboard: { fieldName: "Completions", name: "Fiery Kuudra Completions" } })
  public kuudraFiery: number;

  @Field({ leaderboard: { fieldName: "Completions", name: "Infernal Kuudra Completions" } })
  public kuudraInfernal: number;

  @Field({ leaderboard: { fieldName: "HOTM XP", additionalFields: ["this.hotmLevel"] } })
  public hotmXp: number;

  @Field({ leaderboard: { enabled: false, fieldName: "Level" } })
  public hotmLevel: number;

  @Field()
  public accessoryPower: number;

  @Field()
  public petScore: number;

  @Field()
  public fairySouls: number;

  @Field({ leaderboard: { fieldName: "Trophy Fish Caught" } })
  public trophyFish: number;

  @Field({ leaderboard: { fieldName: "All-Time Chocolate" } })
  public chocolate: number;

  @Field()
  public unsoulboundNetworth: number;

  @Field()
  public mithrilPowder: number;

  @Field()
  public gemstonePowder: number;

  @Field()
  public glacitePowder: number;

  @Field({ leaderboard: { fieldName: "Mage Reputation" } })
  public magesReputation: number;

  @Field({ leaderboard: { fieldName: "Barbarian Reputation" } })
  public barbariansReputation: number;

  @Field()
  public kills: number;

  @Field({ leaderboard: { name: "" } })
  public floors: SkyBlockFloorsBoards;

  @Field({ leaderboard: { name: "Contest Best" } })
  public crops: SkyBlockCropBoards;

  @Field({ leaderboard: { name: "Collection" } })
  public collections: SkyBlockCollectionBoards;

  @Field()
  public bestiary: SkyBlockBestiaryBoards;
}

export const SKYBLOCK_BOARD_MODES = ["overall", "ironman", "stranded", "bingo"] as const;

export interface SkyBlockStatsRow {
  uuid: string;
  profileId: string;
  cuteName: string;
  gameMode: "normal" | "ironman" | "stranded" | "bingo";
  fetchedAt: number;
  networthAsOf?: number;
  boards: Partial<SkyBlockBoards>;
}

/** A member of a profile on the SkyBlock leaderboards: every profile is on `overall`, and a special mode's on its own too. */
@ModelOptions({ schemaOptions: { collection: "skyblockstats", versionKey: false } })
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

    this.id = `${row.uuid}:${row.profileId}`;
    this.uuid = row.uuid;
    this.profileId = row.profileId;
    this.cuteName = row.cuteName;
    this.gameMode = row.gameMode;
    this.fetchedAt = row.fetchedAt;
    this.networthAsOf = row.networthAsOf;

    for (const mode of SKYBLOCK_BOARD_MODES) {
      const ranked = mode === "overall" || mode === row.gameMode;
      this[mode] = Object.assign(new SkyBlockBoards(), ranked ? row.boards : {});
    }
  }
}
