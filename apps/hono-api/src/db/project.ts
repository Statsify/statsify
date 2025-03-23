/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

type ProjectionField<T extends object, K extends keyof T> = K extends string ?
  T[K] extends object ?
		`${K}.${ProjectionField<T[K], keyof T[K]>}` | K
    : K
  : never;

/**
 * Example
 * ```ts
 * const p = {
 *  "baz": true,
 *  "foo.bar": true
 * } satisfies Projection<{
 *  baz: string
 *  foo: {
 *    bar: number;
 *    maz: boolean
 *  };
 * }>;
 * ```
 */
export type Projection<T extends object> = {
  [Key in ProjectionField<T, keyof T>]?: boolean;
};

// Remove any projection fields that aren't selected
type FilterProjection<T extends object, P extends Projection<T>> = {
  [Key in keyof P]: P[Key] extends true ? true : never;
};

/**
 * Picks from an object field via a path string
 * Example:
 * ```ts
 * NestedPick<{ baz: string; foo: { bar: number } }, "foo.bar">
 * >>> { foo: { bar: number } }
 * ```
*/
type NestedPick<T extends object, K extends string> = K extends `${infer F}.${infer Rest}` ?
  F extends keyof T ?
    T[F] extends object ? { [K1 in F]: NestedPick<T[F], Rest> } : T[F] : never
  : K extends keyof T ? { [K1 in K]: T[K] } : never;

type Get<T extends object, K extends string> = K extends `${infer F}.${infer Rest}` ?
  F extends keyof T ?
    T[F] extends object ? Get<T[F], Rest> : T[F] : never
  : K extends keyof T ? T[K] : never;

type UnionToIntersection<U> = (U extends any ? (x: U) => void : never) extends ((x: infer I) => void) ? I : never;

// Filter fields from an object with a given projection object
export type Project<
  T extends object,
  P extends Projection<T>,
  P0 = FilterProjection<T, P>
> = keyof P0 extends string ? UnionToIntersection<NestedPick<T, keyof P0>> : never;

export type KeysOfType<T extends object, R> = keyof {
  [Key in ProjectionField<T, keyof T>]: Get<T, Key> extends R ? Get<T, Key> : never;
};
