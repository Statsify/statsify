/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { isObject } from "./util.js";
import type { APIData } from "./types.js";

export type Flatten<T> = Record<string | keyof T, any>;

export type DeepFlatten<T> = {
  [K in keyof T]-?: (
    x: NonNullable<T[K]> extends infer V
      ? V extends object
        ? V extends readonly any[]
          ? Pick<T, K>
          : DeepFlatten<V> extends infer FV
          ? {
              [P in keyof FV as `${Extract<K, string | number>}.${Extract<
                P,
                string | number
              >}`]: FV[P];
            }
          : never
        : Pick<T, K>
      : never
  ) => void;
} extends Record<keyof T, (y: infer O) => void>
  ? { [K in keyof O]: O[K] }
  : never;

/**
 *
 * @param data The object to be flattened
 * @param prefix The prefix to be added to the keys
 * @param dest The object to be flattened into
 * @returns The flattened object
 * @example ```ts
 * flatten({ a: { b: 1, c: 2 }, d: 3 }); // { 'a.b': 1, 'a.c': 2, 'd': 3 }
 * ```
 */
export const flatten = <T>(data: T, prefix = "", dest: APIData = {}): Flatten<T> => {
  if (isObject(data)) {
    Object.keys(data ?? {}).forEach((key) => {
      const tmpPrefix = prefix.length > 0 ? `${prefix}.${key}` : prefix + key;
      flatten(data[key as keyof T], tmpPrefix, dest);
    });
  } else {
    dest[prefix] = data;
  }

  return dest as Flatten<T>;
};

if (import.meta.vitest) {
  const { suite, it, expect } = import.meta.vitest;

  suite("flatten", () => {
    it("should flatten objects", () => {
      expect(flatten({ a: 1 })).toMatchObject({ a: 1 });
      expect(flatten({ a: { b: { c: 1 } } })).toMatchObject({ "a.b.c": 1 });
      expect(flatten({ a: { b: { c: 1, d: 2 } } })).toMatchObject({
        "a.b.c": 1,
        "a.b.d": 2,
      });
      expect(flatten({ a: [{ b: { c: 1 } }] })).toMatchObject({ a: [{ b: { c: 1 } }] });
    });
  });
}
