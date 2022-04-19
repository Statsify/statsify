import { Constructor } from '@statsify/util';

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

export type LeaderboardDisabledMetadata = {
  enabled: false;

  /**
   * An array of properties that will be shown in the leaderboard.
   */
  additionalFields?: string[];

  /**
   * A property that will be added onto each leaderboard member's display
   */
  extraDisplay?: string;
};

export type LeaderboardEnabledMetadata = {
  enabled: true;

  /**
   * Whether or not to sort the leaderboard ascending or descending.
   */
  sort: 'ASC' | 'DESC';

  /**
   * The pretty print name of the leaderboard.
   */
  name: string;

  /**
   * Aliases for accessing leaderboard.
   */
  aliases: string[];

  /**
   * An array of properties that will be shown in the leaderboard.
   */
  additionalFields: string[];

  /**
   * A property that will be added onto each leaderboard member's display
   */
  extraDisplay?: string;

  /**
   * A function that will be ran when a leaderboard is requested, it will change the format of the number. For example if the field is a time, it will make the time human readable
   */
  formatter?: <T>(value: T) => string;
};

export type LeaderboardMetadata = LeaderboardDisabledMetadata | LeaderboardEnabledMetadata;

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
