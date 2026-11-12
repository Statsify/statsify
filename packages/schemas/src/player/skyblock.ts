/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Field } from "#metadata";
import type { APIData } from "@statsify/util";

/**
 * The SkyBlock values only /player has, kept so SkyBlock lookups can read them without another call.
 * Achievements are the player's best over every profile.
 */
export class PlayerSkyBlock {
  @Field({ leaderboard: { enabled: false } })
  public angler: number;

  @Field({ leaderboard: { enabled: false } })
  public augmentation: number;

  @Field({ leaderboard: { enabled: false } })
  public combat: number;

  @Field({ leaderboard: { enabled: false } })
  public concoctor: number;

  @Field({ leaderboard: { enabled: false } })
  public domesticator: number;

  @Field({ leaderboard: { enabled: false } })
  public excavator: number;

  @Field({ leaderboard: { enabled: false } })
  public gatherer: number;

  @Field({ leaderboard: { enabled: false } })
  public harvester: number;

  @Field({ leaderboard: { enabled: false } })
  public hardWorkingMiner: number;

  @Field({ leaderboard: { enabled: false } })
  public centuryCake: number;

  @Field({ leaderboard: { enabled: false } })
  public centuryCake200: number;

  @Field({ leaderboard: { enabled: false } })
  public potatoTalisman: number;

  @Field({ leaderboard: { enabled: false } })
  public freeCookie: number;

  public constructor(data: APIData) {
    const achievements = data.achievements ?? {};

    this.angler = achievements.skyblock_angler ?? 0;
    this.augmentation = achievements.skyblock_augmentation ?? 0;
    this.combat = achievements.skyblock_combat ?? 0;
    this.concoctor = achievements.skyblock_concoctor ?? 0;
    this.domesticator = achievements.skyblock_domesticator ?? 0;
    this.excavator = achievements.skyblock_excavator ?? 0;
    this.gatherer = achievements.skyblock_gatherer ?? 0;
    this.harvester = achievements.skyblock_harvester ?? 0;
    this.hardWorkingMiner = achievements.skyblock_hard_working_miner ?? 0;

    this.centuryCake = data.claimed_century_cake ?? 0;
    this.centuryCake200 = data.claimed_century_cake200 ?? 0;
    this.potatoTalisman = data.claimed_potato_talisman ?? 0;
    this.freeCookie = data.skyblock_free_cookie ?? 0;
  }
}
