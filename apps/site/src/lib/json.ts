/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

type Fn = (...args: never[]) => unknown;

/**
 * The shape of `T` after a JSON round trip, which is what the Statsify API returns and what route
 * loaders may carry: methods are gone and dates are strings. `@statsify/schemas` classes such as
 * `Player` declare methods (`Color.toString`), so their raw types would not pass Start's
 * serializability check.
 */
export type Json<T> =
  T extends string | number | boolean | null | undefined ? T :
  T extends Date ? string :
  T extends Fn ? never :
  T extends readonly unknown[] ? { [K in keyof T]: Json<T[K]> } :
  T extends object ? { [K in keyof T as T[K] extends Fn ? never : K]: Json<T[K]> } :
  T;
