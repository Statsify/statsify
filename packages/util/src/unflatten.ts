/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import type { APIData } from "./types.js";
import type { Flatten } from "./flatten.js";

/**
 *
 * @param data The object to be unflattened
 * @example ```ts
 * unflatten({ 'stats.bedwars.wins': 1 }); // { stats: { bedwars: { wins: 1 } } }
 * ```
 */
export const unflatten = <T>(instance: Flatten<T>): T => {
  const result: APIData = {};
  const obj = instance as APIData;

  Object.keys(obj).forEach((k) => {
    if (k.includes(".")) {
      const path = k.split(".");
      const x = path.pop();

      const body = path.reduce((cur, p) => {
        if (!(p in cur)) cur[p] = {};
        return cur[p];
      }, result);

      body[x ?? ""] = obj[k];
    } else {
      result[k] = obj[k];
    }
  });

  return result as T;
};
