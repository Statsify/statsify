/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Constructor } from "@statsify/util";
import { LeaderboardMetadata, StoreMetadata, TypeMetadata } from "../metadata.interface";
import { StoreOptions } from "../field.options";

const getDefaultValue = (type: Constructor) =>
  type === String ? "" : type === Number ? 0 : type === Boolean ? false : undefined;

export const getStoreMetadata = (
  typeMetadata: TypeMetadata,
  leaderboardMetadata: LeaderboardMetadata,
  storeOptions?: StoreOptions
): StoreMetadata => ({
  required: storeOptions?.required ?? true,
  store: (leaderboardMetadata.enabled || storeOptions?.store) ?? true,
  serialize: storeOptions?.serialize ?? true,
  deserialize: storeOptions?.deserialize ?? true,
  default:
    storeOptions?.default !== undefined
      ? storeOptions.default
      : getDefaultValue(typeMetadata.type),
});
