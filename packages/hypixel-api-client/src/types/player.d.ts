/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { APIData } from "./APIData";
import { BaseHypixelResponse } from "./base-hypixel-response";
import { HypixelAchievementMode, HypixelGameMode, HypixelLobby } from "./games";
import { HypixelNormalRanks } from "./ranks";

export type ChallengesTime = `day_${string}` | "all__time";
export type AchievementName = `${HypixelAchievementMode}_${string}`;

declare class HypixelPlayerStats {
  [key: HypixelGameMode]: APIData;
}

export declare class HypixelPlayerChallenges {
  [key: `${Uppercase<HypixelGameMode>}_${string}`]: number;
}

export declare class HypixelPlayerQuest {
  public completions?: { time: number }[];
  public active?: {
    started?: number;
    objectives?: { [key: string]: number };
  };
}

export declare class HypixelPlayer {
  [key: string]: any;

  /**
   * The mongo ID of the player in hypixel
   */
  public _id?: string;

  /**
   * The players UUID
   */
  public uuid?: string;

  /**
   * The timestamp of the players first login to hypixel
   */
  public firstLogin?: number;

  /**
   * The name of the player all lowercase
   */
  public playername?: string;

  /**
   * The name of the player
   */
  public displayname?: string;

  public achievementsOneTime?: AchievementName[];
  public networkExp?: number;
  public karma?: number;
  public stats?: HypixelPlayerStats;
  public achievements?: Record<AchievementName, number>;
  public newPackageRank?: HypixelNormalRanks;
  public totalRewards?: number;
  public totalDailyRewards?: number;
  public rewardStreak?: number;
  public rewardScore?: number;
  public rewardHighScore?: number;
  public achievementPoints?: number;
  public challenges?: {
    [key: ChallengesTime]: HypixelPlayerChallenges;
    all_time?: HypixelPlayerChallenges;
  };
  public quests?: Record<string, HypixelPlayerQuest>;
  public parkourCheckpointBests?: { [key: HypixelLobby]: number[] };
  public parkourCompletions?: {
    [key: HypixelLobby]: { timeStart?: number; timeTook?: number }[];
  };
  public rankPlusColor?: string;
  public monthlyPackageRank?: "NONE" | "SUPERSTAR";
  public monthlyRankColor?: "GOLD" | "AQUA";
}

export declare class HypixelPlayerResponse extends BaseHypixelResponse {
  public player: HypixelPlayer;
}
