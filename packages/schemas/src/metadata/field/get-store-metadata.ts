/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import type { Constructor } from "@statsify/util";
import type {
  LeaderboardMetadata,
  StoreMetadata,
  TypeMetadata,
} from "../metadata.interface.js";
import type { StoreOptions } from "../field.options.js";

const getDefaultValue = (type: Constructor) => {
  switch (type) {
    case String:
      return "";
    case Number:
      return 0;
    case Boolean:
      return false;
    default:
      return undefined;
  }
};

export const getStoreMetadata = (
  typeMetadata: TypeMetadata,
  leaderboardMetadata: LeaderboardMetadata,
  storeOptions?: StoreOptions
): StoreMetadata => ({
  required: storeOptions?.required ?? true,
  store: (leaderboardMetadata.enabled || storeOptions?.store) ?? true,
  serialize: storeOptions?.serialize ?? true,
  deserialize: storeOptions?.deserialize ?? true,
  default: storeOptions?.default ?? getDefaultValue(typeMetadata.type),
});
