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
declare const COMPUTED: unique symbol;
declare const REF: unique symbol;

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

interface Types<Output, Input> {
  readonly [TYPES]: { output: Output; input: Input };
}

/** Another field, read through `this` in an object's methods or given to an object's `.leaderboard()` */
export type Ref<S extends AnySchema = AnySchema> = Types<s.infer<S>, s.input<S>> & {
  readonly [REF]: true;
};

type RefOf<E> =
  E extends ObjectSchema<infer D> ? Ref<E> & Refs<D> :
    E extends AnySchema ? Ref<E> :
      E extends () => infer R ? RefOf<R> :
        never;

export type Refs<E> = { [K in keyof E]: RefOf<E[K]> };

type Values<Refs extends readonly Ref[]> = { [I in keyof Refs]: Refs[I][typeof TYPES]["output"] };

const PATH = Symbol("path");

// Any property of a ref is a ref to that field, so `this.overall.wins` reads as "overall.wins"
const ref = (path: string): any =>
  new Proxy(
    {},
    {
      get: (_, key) => {
        if (key === PATH) return path;
        if (typeof key === "string") return ref(path ? `${path}.${key}` : key);
      },
    }
  );

const pathOf = (field: Ref) => (field as unknown as Record<typeof PATH, string>)[PATH];

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
  additionalFields?: Ref[];
  extraDisplay?: Ref;
  resetEvery?: ResetEvery;
}

/** On an object, the names join the path and the rest passes down to leaderboards that don't set their own */
export type ObjectLeaderboardOptions = Pick<
  LeaderboardOptions,
  "fieldName" | "name" | "extraDisplay" | "resetEvery"
>;

/** Paths relative to the object a field is written in, or for an object's own options, to the object */
export type LeaderboardMetadata = Omit<LeaderboardOptions, "additionalFields" | "extraDisplay"> & {
  additionalFields?: string[];
  extraDisplay?: string;
};

export interface IndexOptions {
  unique?: boolean;
  sparse?: boolean;
  expires?: number;
}

export interface ComputedMetadata {
  compute: (...values: any[]) => unknown;
  dependencies: string[];
}

export interface Metadata {
  color?: ColorName;
  format?: Format;
  leaderboard?: LeaderboardMetadata;
  computed?: ComputedMetadata;
  subtractInSessions?: true;
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

interface Computed {
  readonly [COMPUTED]: true;
}

export abstract class Schema<Output = unknown, Input = Output> implements Types<Output, Input> {
  declare public readonly [TYPES]: { output: Output; input: Input };
  public abstract readonly kind: string;
  public readonly meta: Metadata = {};

  /** Recomputed from `dependencies` whenever the value is built, so it can't go stale */
  public computed<const Dependencies extends readonly Ref[]>(
    compute: (...values: Values<Dependencies>) => Output,
    dependencies: Dependencies
  ) {
    return this.with({
      computed: { compute, dependencies: dependencies.map(pathOf) },
    }) as this & Computed;
  }

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

  protected withLeaderboard({ additionalFields, extraDisplay, ...options }: LeaderboardOptions) {
    return this.with({
      leaderboard: {
        ...this.meta.leaderboard,
        ...options,
        ...(additionalFields && { additionalFields: additionalFields.map(pathOf) }),
        ...(extraDisplay && { extraDisplay: pathOf(extraDisplay) }),
      },
    });
  }
}

export class NumberSchema extends Schema<number> {
  public readonly kind = "number";

  public color(color: ColorName) {
    return this.with({ color });
  }

  public format(format: Format) {
    return this.with({ format });
  }

  public leaderboard(leaderboard: LeaderboardOptions | false) {
    return this.withLeaderboard(leaderboard === false ? { enabled: false } : leaderboard);
  }

  /** A session shows how much this went up, instead of computing it again from what was gained */
  public subtractInSessions() {
    return this.with({ subtractInSessions: true });
  }
}

export class StringSchema<T extends string = string> extends Schema<T> {
  public readonly kind = "string";

  public leaderboard(leaderboard: Pick<LeaderboardOptions, "fieldName" | "name">) {
    return this.withLeaderboard(leaderboard);
  }

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

  public leaderboard(
    leaderboard:
      | Omit<ObjectLeaderboardOptions, "extraDisplay"> |
      ((fields: Refs<D>) => ObjectLeaderboardOptions)
  ) {
    return this.withLeaderboard(typeof leaderboard === "function" ? leaderboard(ref("")) : leaderboard);
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
    [K in keyof D as D[K] extends Computed ? never : D[K] extends Optional ? never : K]: s.input<
      D[K]
    >;
  } & {
    [K in keyof D as D[K] extends Computed ? never : D[K] extends Optional ? K : never]?: s.input<
      D[K]
    >;
  }
>;

/** Each entry is a schema, or a method that builds one with the other fields on `this` */
type Entry = AnySchema | (() => AnySchema);

// better-all's pattern: constraining E to Entry would make TypeScript type `this` as the
// constraint, so E stays loose and a bad entry instead becomes a missing key named after it
type Entries<E extends Record<string, any>> = E &
  ThisType<Refs<E>> & {
    [K in keyof E as E[K] extends Entry ? K : `Error: "${K & string}" is not a schema`]-?: E[K];
  };

type Resolve<E extends Record<string, any>> = {
  [K in keyof E]: E[K] extends (() => infer R extends AnySchema) ? R : Extract<E[K], AnySchema>;
};

function resolve<E extends Record<string, any>>(entries: E) {
  const fields = ref("");

  return Object.fromEntries(
    Object.entries(entries).map(([key, entry]) => [
      key,
      typeof entry === "function" ? entry.call(fields) : entry,
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

  /** Fields to spread into several objects, with `this` typed like it is inside `s.object` */
  fields: <E extends Record<string, any>>(entries: Entries<E>): E => entries,

  model: <Name extends string, E extends Record<string, any>>(name: Name, entries: Entries<E>) =>
    new ModelSchema(name, resolve<E>(entries)),

  computed: <const Dependencies extends readonly Ref[]>(
    compute: (...values: Values<Dependencies>) => number,
    dependencies: Dependencies
  ) => new NumberSchema().computed(compute, dependencies),
};
