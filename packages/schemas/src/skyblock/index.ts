/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Field } from "#metadata";
import { FormattedGame } from "#game";
import { modelOptions as ModelOptions } from "@typegoose/typegoose";

const BOARD_LIMIT = 50_000;

/**
 * One mode's boards for a member of a profile, from `toMemberStats` in `@statsify/skyblock`. Each board sets its 50,000
 * rows, since the default limits are sized for player boards.
 */
export class SkyBlockBoards {
  @Field({ leaderboard: { fieldName: "Level", hidden: true, additionalFields: ["this.level"], limit: BOARD_LIMIT } })
  public xp: number;

  @Field({ leaderboard: { enabled: false } })
  public level: number;

  @Field({ leaderboard: { limit: BOARD_LIMIT } })
  public networth: number;

  @Field({ leaderboard: { fieldName: "Non-Cosmetic Networth", limit: BOARD_LIMIT } })
  public nonCosmeticNetworth: number;

  // Maxed members tie on the average, so the board ranks by `skillAverageOrder` (the shown average, then the XP under it)
  @Field({ leaderboard: { fieldName: "Skill Average", hidden: true, additionalFields: ["this.skillAverage"], limit: BOARD_LIMIT } })
  public skillAverageOrder: number;

  @Field({ leaderboard: { enabled: false } })
  public skillAverage: number;

  @Field({ leaderboard: { fieldName: "Farming XP", additionalFields: ["this.farmingLevel"], limit: BOARD_LIMIT } })
  public farmingXp: number;

  @Field({ leaderboard: { enabled: false, fieldName: "Level" } })
  public farmingLevel: number;

  @Field({ leaderboard: { fieldName: "Mining XP", additionalFields: ["this.miningLevel"], limit: BOARD_LIMIT } })
  public miningXp: number;

  @Field({ leaderboard: { enabled: false, fieldName: "Level" } })
  public miningLevel: number;

  @Field({ leaderboard: { fieldName: "Combat XP", additionalFields: ["this.combatLevel"], limit: BOARD_LIMIT } })
  public combatXp: number;

  @Field({ leaderboard: { enabled: false, fieldName: "Level" } })
  public combatLevel: number;

  @Field({ leaderboard: { fieldName: "Foraging XP", additionalFields: ["this.foragingLevel"], limit: BOARD_LIMIT } })
  public foragingXp: number;

  @Field({ leaderboard: { enabled: false, fieldName: "Level" } })
  public foragingLevel: number;

  @Field({ leaderboard: { fieldName: "Fishing XP", additionalFields: ["this.fishingLevel"], limit: BOARD_LIMIT } })
  public fishingXp: number;

  @Field({ leaderboard: { enabled: false, fieldName: "Level" } })
  public fishingLevel: number;

  @Field({ leaderboard: { fieldName: "Enchanting XP", additionalFields: ["this.enchantingLevel"], limit: BOARD_LIMIT } })
  public enchantingXp: number;

  @Field({ leaderboard: { enabled: false, fieldName: "Level" } })
  public enchantingLevel: number;

  @Field({ leaderboard: { fieldName: "Alchemy XP", additionalFields: ["this.alchemyLevel"], limit: BOARD_LIMIT } })
  public alchemyXp: number;

  @Field({ leaderboard: { enabled: false, fieldName: "Level" } })
  public alchemyLevel: number;

  @Field({ leaderboard: { fieldName: "Taming XP", additionalFields: ["this.tamingLevel"], limit: BOARD_LIMIT } })
  public tamingXp: number;

  @Field({ leaderboard: { enabled: false, fieldName: "Level" } })
  public tamingLevel: number;

  @Field({ leaderboard: { fieldName: "Carpentry XP", additionalFields: ["this.carpentryLevel"], limit: BOARD_LIMIT } })
  public carpentryXp: number;

  @Field({ leaderboard: { enabled: false, fieldName: "Level" } })
  public carpentryLevel: number;

  @Field({ leaderboard: { fieldName: "Hunting XP", additionalFields: ["this.huntingLevel"], limit: BOARD_LIMIT } })
  public huntingXp: number;

  @Field({ leaderboard: { enabled: false, fieldName: "Level" } })
  public huntingLevel: number;

  @Field({ leaderboard: { fieldName: "Runecrafting XP", additionalFields: ["this.runecraftingLevel"], limit: BOARD_LIMIT } })
  public runecraftingXp: number;

  @Field({ leaderboard: { enabled: false, fieldName: "Level" } })
  public runecraftingLevel: number;

  @Field({ leaderboard: { fieldName: "Social XP", limit: BOARD_LIMIT } })
  public socialXp: number;

  @Field({ leaderboard: { fieldName: "Catacombs XP", additionalFields: ["this.catacombsLevel"], limit: BOARD_LIMIT } })
  public catacombsXp: number;

  @Field({ leaderboard: { enabled: false, fieldName: "Level" } })
  public catacombsLevel: number;

  @Field({ leaderboard: { fieldName: "Healer XP", additionalFields: ["this.healerLevel"], limit: BOARD_LIMIT } })
  public healerXp: number;

  @Field({ leaderboard: { enabled: false, fieldName: "Level" } })
  public healerLevel: number;

  @Field({ leaderboard: { fieldName: "Mage XP", additionalFields: ["this.mageLevel"], limit: BOARD_LIMIT } })
  public mageXp: number;

  @Field({ leaderboard: { enabled: false, fieldName: "Level" } })
  public mageLevel: number;

  @Field({ leaderboard: { fieldName: "Berserk XP", additionalFields: ["this.berserkLevel"], limit: BOARD_LIMIT } })
  public berserkXp: number;

  @Field({ leaderboard: { enabled: false, fieldName: "Level" } })
  public berserkLevel: number;

  @Field({ leaderboard: { fieldName: "Archer XP", additionalFields: ["this.archerLevel"], limit: BOARD_LIMIT } })
  public archerXp: number;

  @Field({ leaderboard: { enabled: false, fieldName: "Level" } })
  public archerLevel: number;

  @Field({ leaderboard: { fieldName: "Tank XP", additionalFields: ["this.tankLevel"], limit: BOARD_LIMIT } })
  public tankXp: number;

  @Field({ leaderboard: { enabled: false, fieldName: "Level" } })
  public tankLevel: number;

  @Field({ leaderboard: { limit: BOARD_LIMIT } })
  public secrets: number;

  @Field({ leaderboard: { fieldName: "Slayer XP", limit: BOARD_LIMIT } })
  public slayerXp: number;

  @Field({ leaderboard: { fieldName: "Zombie Slayer XP", additionalFields: ["this.zombieLevel"], limit: BOARD_LIMIT } })
  public zombieXp: number;

  @Field({ leaderboard: { enabled: false, fieldName: "Level" } })
  public zombieLevel: number;

  @Field({ leaderboard: { fieldName: "Spider Slayer XP", additionalFields: ["this.spiderLevel"], limit: BOARD_LIMIT } })
  public spiderXp: number;

  @Field({ leaderboard: { enabled: false, fieldName: "Level" } })
  public spiderLevel: number;

  @Field({ leaderboard: { fieldName: "Wolf Slayer XP", additionalFields: ["this.wolfLevel"], limit: BOARD_LIMIT } })
  public wolfXp: number;

  @Field({ leaderboard: { enabled: false, fieldName: "Level" } })
  public wolfLevel: number;

  @Field({ leaderboard: { fieldName: "Enderman Slayer XP", additionalFields: ["this.endermanLevel"], limit: BOARD_LIMIT } })
  public endermanXp: number;

  @Field({ leaderboard: { enabled: false, fieldName: "Level" } })
  public endermanLevel: number;

  @Field({ leaderboard: { fieldName: "Blaze Slayer XP", additionalFields: ["this.blazeLevel"], limit: BOARD_LIMIT } })
  public blazeXp: number;

  @Field({ leaderboard: { enabled: false, fieldName: "Level" } })
  public blazeLevel: number;

  @Field({ leaderboard: { fieldName: "Vampire Slayer XP", additionalFields: ["this.vampireLevel"], limit: BOARD_LIMIT } })
  public vampireXp: number;

  @Field({ leaderboard: { enabled: false, fieldName: "Level" } })
  public vampireLevel: number;

  @Field({ leaderboard: { fieldName: "Completions", name: "Basic Kuudra Completions", limit: BOARD_LIMIT } })
  public kuudraBasic: number;

  @Field({ leaderboard: { fieldName: "Completions", name: "Hot Kuudra Completions", limit: BOARD_LIMIT } })
  public kuudraHot: number;

  @Field({ leaderboard: { fieldName: "Completions", name: "Burning Kuudra Completions", limit: BOARD_LIMIT } })
  public kuudraBurning: number;

  @Field({ leaderboard: { fieldName: "Completions", name: "Fiery Kuudra Completions", limit: BOARD_LIMIT } })
  public kuudraFiery: number;

  @Field({ leaderboard: { fieldName: "Completions", name: "Infernal Kuudra Completions", limit: BOARD_LIMIT } })
  public kuudraInfernal: number;

  @Field({ leaderboard: { fieldName: "HOTM XP", additionalFields: ["this.hotmLevel"], limit: BOARD_LIMIT } })
  public hotmXp: number;

  @Field({ leaderboard: { enabled: false, fieldName: "Level" } })
  public hotmLevel: number;

  @Field({ leaderboard: { limit: BOARD_LIMIT } })
  public accessoryPower: number;

  @Field({ leaderboard: { limit: BOARD_LIMIT } })
  public petScore: number;

  @Field({ leaderboard: { limit: BOARD_LIMIT } })
  public fairySouls: number;

  @Field({ leaderboard: { fieldName: "Trophy Fish Caught", limit: BOARD_LIMIT } })
  public trophyFish: number;

  @Field({ leaderboard: { fieldName: "All-Time Chocolate", limit: BOARD_LIMIT } })
  public chocolate: number;
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

export const skyblockStatsId = (uuid: string, profileId: string) => `${uuid}:${profileId}`;
export const skyblockStatsUuid = (id: string) => id.split(":")[0];

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

    this.id = skyblockStatsId(row.uuid, row.profileId);
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
