import { Constructor } from '@statsify/util';
import { BasePropOptions } from '@typegoose/typegoose/lib/types';
import { LeaderboardEnabledMetadata, StoreMetadata } from './metadata.interface';

export type TypeOptions = () => Constructor | [Constructor];
export type LeaderboardOptions =
  | Omit<BasePropOptions, 'name'>
  | Partial<Omit<LeaderboardEnabledMetadata, 'name'>>;
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

export interface FieldOptions {
  type?: TypeOptions;
  leaderboard?: LeaderboardOptions;
  store?: StoreOptions;
  docs?: DocOptions;
  mongo?: Partial<BasePropOptions>;
}
