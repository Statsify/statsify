/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Constructor } from "@statsify/util";

export type Getter<T> = (target: T) => any;

export interface FieldMetadata {
  type: TypeMetadata;
  leaderboard: LeaderboardMetadata;
  store: StoreMetadata;
}

export interface TypeMetadata {
  type: Constructor;
  array: boolean;
  primitive: boolean;
}

interface BaseLeaderboardMetadata {
  /**
   * An array of properties that will be shown in the leaderboard.
   */
  additionalFields?: string[];

  /**
   * A property that will be added onto each leaderboard member's display
   */
  extraDisplay?: string;

  /**
   * A function that will be ran when a leaderboard is requested, it will change the format of the number. For example if the field is a time, it will make the time human readable
   */
  formatter?: <T>(value: T) => string;

  /**
   * The pretty print name of the leaderboard.
   * @example Wins
   */
  fieldName?: string;

  /**
   * The complete leaderboard name
   * @example BedWars Overall Wins
   */
  name: string;

  default?: any;

  /**
   * When to reset the leaderboard, leaderboards will reset at the desired time at midnight.
   */
  resetEvery?:
    | "day"
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday";
}

export interface LeaderboardDisabledMetadata extends BaseLeaderboardMetadata {
  enabled: false;
}

export type LeaderboardSort = "ASC" | "DESC";

export interface LeaderboardEnabledMetadata extends BaseLeaderboardMetadata {
  enabled: true;

  /**
   * Whether or not to show the stat in the leaderboard page
   */
  historicalEnabled?: boolean;

  /**
   * Whether or not to show the stat in the leaderboard page
   */
  hidden?: boolean;

  /**
   * Whether or not to sort the leaderboard ascending or descending.
   */
  sort: LeaderboardSort;

  /**
   * Aliases for accessing leaderboard.
   */
  aliases: string[];

  /**
   * How many members to show in the leaderboard.
   */
  limit: number;
}

export type LeaderboardMetadata =
  | LeaderboardDisabledMetadata
  | LeaderboardEnabledMetadata;

export interface StoreMetadata {
  /**
   * Whether or not the field is required to be present
   */
  required: boolean;

  /**
   * Whether or not to store the field in the database.
   */
  store: boolean;

  /**
   * Whether or not the field should be processed by the serializer.
   */
  serialize: boolean;

  /**
   * Whether or not the field should be processed by the deserializer.
   */
  deserialize: boolean;

  default?: any;
}

export interface ClassMetadata {
  [key: string]: FieldMetadata;
}
