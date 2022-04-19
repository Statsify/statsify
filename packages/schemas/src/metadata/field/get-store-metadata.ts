import { Constructor } from '@statsify/util';
import { StoreOptions } from '../field.options';
import { LeaderboardMetadata, StoreMetadata, TypeMetadata } from '../metadata.interface';

const getDefaultValue = (type: Constructor) =>
  type === String ? '' : type === Number ? 0 : type === Boolean ? false : undefined;

export const getStoreMetadata = (
  typeMetadata: TypeMetadata,
  leaderboardMetadata: LeaderboardMetadata,
  storeOptions?: StoreOptions
): StoreMetadata => {
  return {
    required: storeOptions?.required ?? true,
    store: (leaderboardMetadata.enabled || storeOptions?.store) ?? true,
    serialize: storeOptions?.serialize ?? true,
    deserialize: storeOptions?.deserialize ?? true,
    default: storeOptions?.default ?? getDefaultValue(typeMetadata.type),
  };
};
