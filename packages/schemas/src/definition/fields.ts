/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { prettify } from "@statsify/util";
import type { AnySchema, ObjectSchema, RecordSchema, ResetEvery, s } from "./s.js";
import type { Format } from "./format.js";

interface BaseLeaderboard {
  fieldName: string;
  name: string;
  additionalFields: string[];
  extraDisplay?: string;
  format?: Format;
  resetEvery?: ResetEvery;
}

export interface DisabledLeaderboard extends BaseLeaderboard {
  enabled: false;
}

export interface EnabledLeaderboard extends BaseLeaderboard {
  enabled: true;
  sort: "ASC" | "DESC";
  limit: number;
  aliases: string[];
  hidden?: boolean;
}

export type Leaderboard = EnabledLeaderboard | DisabledLeaderboard;

export interface Store {
  required: boolean;
  store: boolean;
  serialize: boolean;
  deserialize: boolean;
  default: unknown;
}

export interface Field {
  path: string;
  schema: Exclude<AnySchema, ObjectSchema | RecordSchema<any>>;
  leaderboard: Leaderboard;
  store: Store;
  /** The stored paths a computed value, or the computed object it's in, is built from */
  dependencies?: string[];
}

const getDefault = (schema: AnySchema): unknown => {
  switch (schema.kind) {
    case "number":
      return 0;
    case "string":
      return "";
    case "boolean":
      return false;
    // Arrays have always read back as their element's default, so a missing string array is ""
    case "array":
      return getDefault(schema.element);
    default:
      return undefined;
  }
};

const isRanked = (schema: AnySchema) =>
  schema.kind === "number" && schema.meta.leaderboard?.enabled !== false;

// A ranked stat is always stored, whatever its store option says
export const isStored = (schema: AnySchema) => isRanked(schema) || schema.meta.store !== false;

const join = (base: string, path: string) => (base ? `${base}.${path}` : path);

/** `relativeTo` is the object a field is written in, or for an object's own options, the object */
function getLeaderboard(schema: AnySchema, key: string, relativeTo: string): Leaderboard {
  const options = schema.meta.leaderboard ?? {};
  const fieldName = options.fieldName ?? prettify(key);

  const base: BaseLeaderboard = {
    fieldName,
    name: options.name ?? fieldName,
    additionalFields: options.additionalFields?.map((path) => join(relativeTo, path)) ?? [],
    extraDisplay: options.extraDisplay && join(relativeTo, options.extraDisplay),
    format: schema.meta.format,
    resetEvery: options.resetEvery,
  };

  if (!isRanked(schema)) return { ...base, enabled: false };

  return {
    ...base,
    enabled: true,
    sort: options.sort ?? "DESC",
    limit: options.limit ?? 50_000,
    aliases: options.aliases ?? [],
    hidden: options.hidden,
  };
}

function getStore(schema: AnySchema): Store {
  return {
    required: !schema.meta.optional,
    store: isStored(schema),
    serialize: !schema.meta.raw,
    deserialize: !schema.meta.raw,
    default: schema.meta.default ?? getDefault(schema),
  };
}

function flatten(schema: ObjectSchema, base: string, baseName: string): Field[] {
  const fields: Field[] = [];

  for (const [key, child] of Object.entries(schema.definition as Record<string, AnySchema>)) {
    // Flattening splits a record into its own keys, so like the classes' Mixed fields, it has no field to list
    if (child.kind === "record") continue;

    const path = join(base, key);
    const leaderboard = getLeaderboard(child, key, child.kind === "object" ? path : base);
    const name = leaderboard.name ? `${baseName ? `${baseName} ` : ""}${leaderboard.name}` : baseName;
    const dependencies = child.meta.computed?.dependencies.map((dependency) => join(base, dependency));

    if (child.kind !== "object") {
      fields.push({
        path,
        schema: child,
        leaderboard: { ...leaderboard, name },
        store: getStore(child),
        ...(dependencies && { dependencies }),
      });

      continue;
    }

    for (const field of flatten(child, path, name)) {
      field.leaderboard.extraDisplay ??= leaderboard.extraDisplay;
      field.leaderboard.resetEvery ??= leaderboard.resetEvery;
      if (dependencies) field.dependencies = dependencies;

      fields.push(field);
    }
  }

  return fields;
}

const cache = new WeakMap<ObjectSchema, Field[]>();

export function getFields(schema: ObjectSchema): Field[] {
  let fields = cache.get(schema);

  if (!fields) {
    fields = flatten(schema, "", "");
    cache.set(schema, fields);
  }

  return fields;
}

export function getLeaderboardFields(schema: ObjectSchema) {
  return getFields(schema).filter(
    (field): field is Field & { leaderboard: EnabledLeaderboard } => field.leaderboard.enabled
  );
}

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;
  const { s } = await import("./s.js");
  const { ratio } = await import("@statsify/math");

  const Mode = s.object({
    wins: s.number(),
    losses: s.number(),
    wlr() {
      return s.number().computed(ratio, [this.wins, this.losses]).leaderboard({ fieldName: "WLR" });
    },
    coins() {
      return s.number().leaderboard({ fieldName: "Tokens", limit: 10, additionalFields: [this.wins] });
    },
    tags: s.array(s.string()),
    seen: s.boolean().optional(),
  });

  const Root = s.object({
    game: s
      .object({
        title: s.string().default("none"),
        overall: Mode,
        extra: s.object({ points: s.number() }).leaderboard({ fieldName: "" }),
      })
      .leaderboard((game) => ({ fieldName: "Game", extraDisplay: game.title })),
  });

  it("flattens paths, names, columns, limits and defaults", () => {
    const fields = Object.fromEntries(getFields(Root).map((field) => [field.path, field]));

    expect(Object.keys(fields)).toEqual([
      "game.title",
      "game.overall.wins",
      "game.overall.losses",
      "game.overall.wlr",
      "game.overall.coins",
      "game.overall.tags",
      "game.overall.seen",
      "game.extra.points",
    ] satisfies s.path<typeof Root>[]);

    expect(fields["game.overall.wlr"]).toMatchObject({
      dependencies: ["game.overall.wins", "game.overall.losses"],
      leaderboard: {
        enabled: true,
        fieldName: "WLR",
        name: "Game Overall WLR",
        additionalFields: [],
        extraDisplay: "game.title",
        limit: 50_000,
      },
    });

    expect(fields["game.overall.coins"].leaderboard).toMatchObject({
      name: "Game Overall Tokens",
      limit: 10,
      additionalFields: ["game.overall.wins"],
    });

    expect(fields["game.extra.points"].leaderboard).toMatchObject({ name: "Game Points", limit: 50_000 });
    expect(fields["game.title"].leaderboard.enabled).toBe(false);
    expect(fields["game.title"].store.default).toBe("none");
    expect(fields["game.overall.tags"].store.default).toBe("");
    expect(fields["game.overall.seen"].store).toMatchObject({ required: false, default: false });
  });

  it("leaves records out", () => {
    const Commands = s.object({ name: s.string(), usage: s.record(s.number()) });

    expect(getFields(Commands).map((field) => field.path)).toEqual([
      "name",
    ] satisfies s.path<typeof Commands>[]);
  });
}
