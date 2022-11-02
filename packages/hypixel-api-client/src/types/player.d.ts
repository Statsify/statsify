/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { BaseHypixelResponse } from "./base-hypixel-response";
import { HypixelAchievementMode, HypixelGameMode, HypixelLobby } from "./games";
import { HypixelNormalRanks } from "./ranks";
import { HypixelPlayerStats } from "./player-stats";

export type ChallengesTime = `day_${string}` | "all__time";
export type AchievementName = `${HypixelAchievementMode}_${string}`;

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

export declare class HypixelPlayer_Settings {
  public fishCollectorShowCaught?: boolean;
}

export declare class HypixelPlayerSeasonal {
  [key: "halloween" | "summer"]: { "2022"?: { levelling?: { experience: number } } };
  public silver: number;
}

export type HypixelPlayerAchievementRewardsNew = {
  [key: `for_points_${number}00`]: number;
};

export declare class HypixelPlayer<PName = string> {
  [key: string]: any;

  /**
   * The mongo ID of the player in hypixel
   */
  public _id?: string;

  public _settings?: HypixelPlayer_Settings;

  /**
   * The players UUID
   */
  public uuid: string;

  /**
   * The timestamp of the players first login to hypixel
   */
  public firstLogin?: number;

  /**
   * The name of the player all lowercase
   */
  public playername?: Lowercase<PName>;

  /**
   * The name of the player
   */
  public displayname: PName;

  public achievementsOneTime?: AchievementName[];
  public achievementRewardsNew?: HypixelPlayerAchievementRewardsNew;
  public networkExp?: number;
  public karma?: number;
  public stats?: HypixelPlayerStats;
  public socialMedia?: {
    links: {
      DISCORD?: string;
      HYPIXEL?: string;
      INSTAGRAM?: string;
      MIXER?: string;
      TWITCH?: string;
      TWITTER?: string;
      YOUTUBE?: string;
    };
  };
  public achievements?: Record<AchievementName, number>;
  public newPackageRank?: HypixelNormalRanks;
  public totalRewards?: number;
  public totalDailyRewards?: number;
  public rewardStreak?: number;
  public rewardScore?: number;
  public rewardHighScore?: number;
  public achievementPoints?: number;
  public battlePassGlowStatus?: boolean;
  public firstLogin?: number;
  public seasonal?: HypixelPlayerSeasonal;
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
