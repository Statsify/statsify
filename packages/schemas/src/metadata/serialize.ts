/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { MetadataScanner } from "./metadata-scanner.js";
import type { Constructor, Flatten } from "@statsify/util";
import type { FieldMetadata } from "./metadata.interface.js";

export const serialize = <T>(
  constructor: Constructor<T>,
  instance: Flatten<T>
): Flatten<T> => {
  const metadataEntries = MetadataScanner.scan(constructor) as [
    keyof Flatten<T>,
    FieldMetadata
  ][];

  const serialized: Flatten<T> = {} as Flatten<T>;

  for (const [
    key,
    {
      store: { store, serialize, default: defaultValue },
    },
  ] of metadataEntries) {
    //This value shouldn't be stored in the database
    if (!store) continue;

    //The value should not be processed
    if (!serialize) {
      serialized[key] = instance[key];
      continue;
    }

    //Don't include the value if it is undefined or it is the default value
    if (instance[key] === undefined || instance[key] === defaultValue) continue;
    serialized[key] = instance[key];
  }

  return serialized;
};
