/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

export type APIData = Record<string, any>;

export type RemoveMethods<T> = Pick<
  T,
  // eslint-disable-next-line @typescript-eslint/ban-types
  { [Key in keyof T]: T[Key] extends Function ? never : Key }[keyof T]
>;

export type Constructor<T = any> = new (...args: any[]) => T;
export type UnwrapConstructor<T> = T extends Constructor<infer U> ? U : never;
