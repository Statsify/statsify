/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { BaseHypixelResponse } from "./base-hypixel-response";
import { HypixelNormalRanks } from "./ranks";

declare class HypixelPlayerStats {
  public SkyWars?: { [key: string]: any };
  public HungerGames?: { [key: string]: any };
  public Walls?: { [key: string]: any };
  public BattleGround?: { [key: string]: any };
  public UHC?: { [key: string]: any };
  public Walls3?: { [key: string]: any };
  public Arcade?: { [key: string]: any };
  public Quake?: { [key: string]: any };
  public SpeedUHC?: { [key: string]: any };
  public TNTGames?: { [key: string]: any };
  public Arena?: { [key: string]: any };
  public Paintball?: { [key: string]: any };
  public MCGO?: { [key: string]: any };
  public VampireZ?: { [key: string]: any };
  public GingerBread?: { [key: string]: any };
  public SuperSmash?: { [key: string]: any };
  public TrueCombat?: { [key: string]: any };
  public SkyClash?: { [key: string]: any };
  public Bedwars?: { [key: string]: any };
  public Duels?: { [key: string]: any };
  public MurderMystery?: { [key: string]: any };
  public BuildBattle?: { [key: string]: any };
  public Legacy?: { [key: string]: any };
  public Pit?: { [key: string]: any };
  public Housing?: { [key: string]: any };
  public WoolGames?: { [key: string]: any };
}

export declare class HypixelPlayerChallenges {
  [key: string]: number;
}

export declare class HypixelPlayerQuest {
  public completions?: { time: number }[];
  public active?: {
    started?: number;
    objectives?: { [key: string]: number };
  };
}

export declare class HypixelPlayer extends BaseHypixelResponse {
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

  /**
   * Known previous names of the player
   */
  public knownAliases?: string[];

  /**
   * Known previous names of the player all lowercased
   */
  public knownAliasesLower?: string[];

  public achievementsOneTime?: string[];
  public networkExp?: number;
  public karma?: number;
  public stats?: HypixelPlayerStats;
  public achievements?: Record<string, number>;
  public newPackageRank?: HypixelNormalRanks;
  public totalRewards?: number;
  public totalDailyRewards?: number;
  public rewardStreak?: number;
  public rewardScore?: number;
  public rewardHighScore?: number;
  public achievementPoints?: number;
  public challenges?: {
    [key: string]: Record<string, HypixelPlayerChallenges>;
    all_time?: Record<string, HypixelPlayerChallenges>;
  };
  public quests?: Record<string, HypixelPlayerQuest>;
  public parkourCheckpointBests?: { [key: string]: number[] };
  public parkourCompletions?: {
    [key: string]: { timeStart?: number; timeTook?: number }[];
  };
  public rankPlusColor?: string;
  public monthlyPackageRank?: "NONE" | "SUPERSTAR";
  public monthlyRankColor?: "GOLD" | "AQUA";
}
