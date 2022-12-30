/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { BaseHypixelResponse } from "./base-hypixel-response";
import { HypixelAchievementMode, HypixelGameMode, HypixelLobby } from "./games";
import { HypixelNormalRank } from "./ranks";
import { HypixelPlayerStats } from "./player-stats";

export type ChallengesTime = `day_${string}` | "all__time";
export type AchievementName = `${HypixelAchievementMode}_${string}`;

export interface PeriodicChallenges {
  [key: `${Uppercase<HypixelGameMode>}_${string}`]: number;
}

export type Challenges = {
  [key: ChallengesTime]: PeriodicChallenges;
  all_time?: PeriodicChallenges;
};

export interface Quest {
  completions?: { time: number }[];
  active?: {
    started?: number;
    objectives?: { [key: string]: number };
  };
}

export interface PlayerSettings {
  fishCollectorShowCaught?: boolean;
}

export interface SeasonalStats {
  [key: "halloween" | "summer"]: { "2022"?: { levelling?: { experience: number } } };
  silver: number;
}

export type AchievementRewardsNew = {
  [key: `for_points_${number}00`]: number;
};

export interface SocialMedia {
  links: {
    DISCORD?: string;
    HYPIXEL?: string;
    INSTAGRAM?: string;
    MIXER?: string;
    TWITCH?: string;
    TWITTER?: string;
    YOUTUBE?: string;
  };
}

export type ParkourCompletions = {
  [key: HypixelLobby]: { timeStart?: number; timeTook?: number }[];
};

export interface HypixelPlayer<PName = string> {
  [key: string]: any;

  /**
   * The mongo ID of the player in hypixel
   */
  _id?: string;

  _settings?: PlayerSettings;

  /**
   * The players UUID
   */
  uuid: string;

  /**
   * The timestamp of the players first login to hypixel
   */
  firstLogin?: number;

  /**
   * The name of the player all lowercase
   */
  playername?: Lowercase<PName>;

  /**
   * The name of the player
   */
  displayname: PName;

  achievementsOneTime?: AchievementName[];
  achievementRewardsNew?: AchievementRewardsNew;
  networkExp?: number;
  karma?: number;
  stats?: HypixelPlayerStats;
  socialMedia?: SocialMedia;
  achievements?: Record<AchievementName, number>;
  newPackageRank?: HypixelNormalRank;
  totalRewards?: number;
  totalDailyRewards?: number;
  rewardStreak?: number;
  rewardScore?: number;
  rewardHighScore?: number;
  achievementPoints?: number;
  battlePassGlowStatus?: boolean;
  firstLogin?: number;
  seasonal?: SeasonalStats;
  challenges?: Challenges;
  quests?: Record<string, Quest>;
  parkourCheckpointBests?: { [key: HypixelLobby]: number[] };
  parkourCompletions?: ParkourCompletions;
  rankPlusColor?: string;
  monthlyPackageRank?: "NONE" | "SUPERSTAR";
  monthlyRankColor?: "GOLD" | "AQUA";
}

export interface HypixelPlayerResponse extends BaseHypixelResponse {
  player: HypixelPlayer;
}
