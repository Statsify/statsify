/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import type { Format } from "./format.js";
import type { minecraftColors } from "@statsify/util";

declare const TYPES: unique symbol;
declare const OPTIONAL: unique symbol;

export type ColorName = Lowercase<(typeof minecraftColors)[number]["id"]>;

export type ResetEvery =
  | "day" |
  "monday" |
  "tuesday" |
  "wednesday" |
  "thursday" |
  "friday" |
  "saturday" |
  "sunday";

export interface LeaderboardOptions {
  enabled?: boolean;
  /** The stat's own name, `Wins` */
  fieldName?: string;
  /** Replaces `fieldName` in the full name, which joins every name on the path: `BedWars Overall Wins` */
  name?: string;
  limit?: number;
  sort?: "ASC" | "DESC";
  hidden?: boolean;
  aliases?: string[];
  additionalFields?: string[];
  extraDisplay?: string;
  resetEvery?: ResetEvery;
}

/** On an object, the names join the path and the rest passes down to leaderboards that don't set their own */
export type ObjectLeaderboardOptions = Pick<
  LeaderboardOptions,
  "fieldName" | "name" | "additionalFields" | "extraDisplay" | "resetEvery"
>;

export interface IndexOptions {
  unique?: boolean;
  sparse?: boolean;
  expires?: number;
}

export interface Metadata {
  color?: ColorName;
  format?: Format;
  leaderboard?: LeaderboardOptions;
  default?: unknown;
  optional?: true;
  store?: false;
  raw?: true;
  index?: IndexOptions;
  lowercase?: true;
}

interface Optional {
  readonly [OPTIONAL]: true;
}

export abstract class Schema<Output = unknown, Input = Output> {
  declare public readonly [TYPES]: { output: Output; input: Input };
  public abstract readonly kind: string;
  public readonly meta: Metadata = {};

  public default(value: Output) {
    return this.with({ default: value });
  }

  public optional() {
    return this.with({ optional: true }) as this & Optional;
  }

  /** Never written to the database, like `cached` */
  public store(store: false) {
    return this.with({ store });
  }

  /** Written and read back as is, with no default dropped or filled in */
  public raw() {
    return this.with({ raw: true });
  }

  public index(index: IndexOptions = {}) {
    return this.with({ index });
  }

  protected with(meta: Metadata): this {
    const copy = Object.create(Object.getPrototypeOf(this)) as this;
    return Object.assign(copy, this, { meta: { ...this.meta, ...meta } });
  }

  protected withLeaderboard(leaderboard: LeaderboardOptions) {
    return this.with({ leaderboard: { ...this.meta.leaderboard, ...leaderboard } });
  }
}

abstract class StatSchema<Input> extends Schema<number, Input> {
  public color(color: ColorName) {
    return this.with({ color });
  }

  public format(format: Format) {
    return this.with({ format });
  }

  public leaderboard(leaderboard: LeaderboardOptions | false) {
    return this.withLeaderboard(leaderboard === false ? { enabled: false } : leaderboard);
  }
}

export class NumberSchema extends StatSchema<number> {
  public readonly kind = "number";
}

export class RatioSchema extends StatSchema<never> {
  public readonly kind = "ratio";

  public constructor(
    public readonly numerator: string,
    public readonly denominator: string,
    public readonly multiplier: number
  ) {
    super();
  }
}

export class StringSchema<T extends string = string> extends Schema<T> {
  public readonly kind = "string";

  public lowercase() {
    return this.with({ lowercase: true });
  }
}

export class BooleanSchema extends Schema<boolean> {
  public readonly kind = "boolean";
}

export class ArraySchema<E extends AnySchema> extends Schema<s.infer<E>[], s.input<E>[]> {
  public readonly kind = "array";

  public constructor(public readonly element: E) {
    super();
  }
}

export type Definition = Record<string, AnySchema>;

export class ObjectSchema<D extends Definition = Definition> extends Schema<
  OutputOf<D>,
  InputOf<D>
> {
  public readonly kind = "object";

  public constructor(public readonly definition: D) {
    super();
  }

  public leaderboard(leaderboard: ObjectLeaderboardOptions) {
    return this.withLeaderboard(leaderboard);
  }
}

export class ModelSchema<
  Name extends string = string,
  D extends Definition = Definition,
> extends ObjectSchema<D> {
  public constructor(public readonly name: Name, definition: D) {
    super(definition);
  }
}

export type AnySchema =
  | NumberSchema |
  RatioSchema |
  StringSchema |
  BooleanSchema |
  ArraySchema<any> |
  ObjectSchema<any>;

type Simplify<T> = { [K in keyof T]: T[K] } & {};

type OutputOf<D extends Definition> = Simplify<
  { [K in keyof D as D[K] extends Optional ? never : K]: s.infer<D[K]> } & {
    [K in keyof D as D[K] extends Optional ? K : never]?: s.infer<D[K]>;
  }
>;

type InputOf<D extends Definition> = Simplify<
  {
    [K in keyof D as D[K] extends RatioSchema ? never : D[K] extends Optional ? never : K]: s.input<
      D[K]
    >;
  } & {
    [K in keyof D as D[K] extends RatioSchema ? never : D[K] extends Optional ? K : never]?: s.input<
      D[K]
    >;
  }
>;

/** Each entry is a schema, or a method that computes a field from the others through `this` */
type Entry = AnySchema | (() => RatioSchema);

// better-all's pattern: constraining E to Entry would make TypeScript type `this` as the
// constraint, so E stays loose and a bad entry instead becomes a missing key named after it
type Entries<E extends Record<string, any>> = E &
  ThisType<{ [K in keyof E]: E[K] }> & {
    [K in keyof E as E[K] extends Entry ? K : `Error: "${K & string}" is not a schema`]-?: E[K];
  };

type Resolve<E extends Record<string, any>> = {
  [K in keyof E]: E[K] extends (() => infer R extends RatioSchema) ? R : Extract<E[K], AnySchema>;
};

function resolve<E extends Record<string, any>>(entries: E) {
  // Computed methods run once, with each field's key standing in for its schema on `this`
  const keys = Object.fromEntries(Object.keys(entries).map((key) => [key, key]));

  return Object.fromEntries(
    Object.entries(entries).map(([key, entry]) => [
      key,
      typeof entry === "function" ? entry.call(keys) : entry,
    ])
  ) as Resolve<E>;
}

export namespace s {
  export type infer<S extends AnySchema> = S[typeof TYPES]["output"];
  export type input<S extends AnySchema> = S[typeof TYPES]["input"];
}

export const s = {
  number: () => new NumberSchema(),
  string: <T extends string = string>() => new StringSchema<T>(),
  boolean: () => new BooleanSchema(),
  array: <E extends AnySchema>(element: E) => new ArraySchema(element),

  object: <E extends Record<string, any>>(entries: Entries<E>) =>
    new ObjectSchema(resolve<E>(entries)),

  model: <Name extends string, E extends Record<string, any>>(name: Name, entries: Entries<E>) =>
    new ModelSchema(name, resolve<E>(entries)),

  ratio: (numerator: NumberSchema, denominator: NumberSchema, multiplier = 1) =>
    new RatioSchema(numerator as unknown as string, denominator as unknown as string, multiplier),
};
