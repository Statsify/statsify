import { Constructor } from '@statsify/util';
import {
  LeaderboardDisabledMetadata,
  LeaderboardEnabledMetadata,
  StoreMetadata,
} from './metadata.interface';

export type TypeOptions = () => Constructor | [Constructor];
export type LeaderboardOptions = LeaderboardDisabledMetadata | Partial<LeaderboardEnabledMetadata>;
export type StoreOptions = Partial<StoreMetadata>;

export type DocOptions = Partial<{
  hide: boolean;
  examples: string[];
  enum: any[];
  enumName: string;
  description: string;
  deprecated: boolean;
  min: number;
  max: number;
}>;

export type MongoOptions = Partial<{
  index: boolean;
  unique: boolean;
  sparse: boolean;
  lowercase: boolean;
  uppercase: boolean;
}>;

export interface FieldOptions {
  type?: TypeOptions;
  leaderboard?: LeaderboardOptions;
  store?: StoreOptions;
  docs?: DocOptions;
  mongo?: MongoOptions;
}
