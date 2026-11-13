/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { parseAdditionalFields } from "../util/parse-fields.js";
import { prettify } from "@statsify/util";
import type { AnySchema, ObjectSchema, ResetEvery } from "./s.js";
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
  schema: Exclude<AnySchema, ObjectSchema>;
  leaderboard: Leaderboard;
  store: Store;
}

const NAMES: Record<string, string> = {
  exp: "EXP",
  wlr: "WLR",
  kdr: "KDR",
  fkdr: "FKDR",
  bblr: "BBLR",
  kwr: "KWR",
  quakeShotAccuracy: "Shot Accuracy",
};

const getDefaultLimit = (key: string) => {
  switch (key) {
    case "exp":
      return 1_000_000;

    case "wins":
    case "wlr":
    case "kills":
    case "kdr":
    case "finalKills":
    case "fkdr":
    case "bedsBroken":
    case "bblr":
      return 500_000;

    case "losses":
    case "deaths":
    case "finalDeaths":
    case "bedsLost":
    case "assists":
    case "coins":
    case "lootChests":
      return 100_000;

    default:
      return 50_000;
  }
};

// Each stat in one of these shows the others present beside it as columns
const RATIO_COLUMNS = [
  ["wins", "losses", "wlr"],
  ["kills", "deaths", "kdr"],
  ["finalKills", "finalDeaths", "fkdr"],
  ["bedsBroken", "bedsLost", "bblr"],
];

const getDefault = (schema: AnySchema): unknown => {
  switch (schema.kind) {
    case "number":
    case "ratio":
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
  (schema.kind === "number" || schema.kind === "ratio") && schema.meta.leaderboard?.enabled !== false;

// A ranked stat is always stored, whatever its store option says
export const isStored = (schema: AnySchema) => isRanked(schema) || schema.meta.store !== false;

function getLeaderboard(schema: AnySchema, key: string): Leaderboard {
  const options = schema.meta.leaderboard ?? {};
  const fieldName = options.fieldName ?? NAMES[key] ?? prettify(key);

  const base: BaseLeaderboard = {
    fieldName,
    name: options.name ?? fieldName,
    additionalFields: options.additionalFields ?? [],
    extraDisplay: options.extraDisplay,
    format: schema.meta.format,
    resetEvery: options.resetEvery,
  };

  if (!isRanked(schema)) return { ...base, enabled: false };

  return {
    ...base,
    enabled: true,
    sort: options.sort ?? "DESC",
    limit: options.limit ?? getDefaultLimit(key),
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
  const keys = Object.keys(schema.definition);
  const fields: Field[] = [];

  for (const [key, child] of Object.entries(schema.definition)) {
    const path = base ? `${base}.${key}` : key;
    const leaderboard = getLeaderboard(child, key);
    const name = leaderboard.name ? `${baseName ? `${baseName} ` : ""}${leaderboard.name}` : baseName;

    const columns = RATIO_COLUMNS.find((ratio) => ratio.includes(key))
      ?.filter((other) => other !== key && keys.includes(other))
      .map((other) => (base ? `${base}.${other}` : other));

    if (columns?.length) leaderboard.additionalFields = columns;

    if (child.kind !== "object") {
      fields.push({
        path,
        schema: child,
        leaderboard: { ...leaderboard, name },
        store: getStore(child),
      });

      continue;
    }

    for (const field of flatten(child, path, name)) {
      if (field.leaderboard.additionalFields.length === 0)
        field.leaderboard.additionalFields = leaderboard.additionalFields;

      field.leaderboard.extraDisplay ??= leaderboard.extraDisplay;
      field.leaderboard.resetEvery ??= leaderboard.resetEvery;

      fields.push(field);
    }
  }

  return fields;
}

const cache = new WeakMap<ObjectSchema, Field[]>();

export function getFields(schema: ObjectSchema): Field[] {
  let fields = cache.get(schema);
  if (fields) return fields;

  fields = flatten(schema, "", "").map((field) => {
    const { additionalFields, extraDisplay } = field.leaderboard;

    field.leaderboard.additionalFields = additionalFields.map((key) =>
      parseAdditionalFields(field.path, key)
    );

    if (extraDisplay) field.leaderboard.extraDisplay = parseAdditionalFields(field.path, extraDisplay);

    return field;
  });

  cache.set(schema, fields);
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

  const Mode = s.object({
    wins: s.number(),
    losses: s.number(),
    wlr() {
      return s.ratio(this.wins, this.losses);
    },
    coins: s.number().leaderboard({ fieldName: "Tokens", limit: 10 }),
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
      .leaderboard({ fieldName: "Game", extraDisplay: "this.game.title" }),
  });

  it("flattens names, columns, limits and defaults", () => {
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
    ]);

    expect(fields["game.overall.wlr"].leaderboard).toEqual({
      enabled: true,
      fieldName: "WLR",
      name: "Game Overall WLR",
      additionalFields: ["game.overall.wins", "game.overall.losses"],
      extraDisplay: "game.title",
      sort: "DESC",
      limit: 500_000,
      aliases: [],
    });

    expect(fields["game.overall.coins"].leaderboard).toMatchObject({ name: "Game Overall Tokens", limit: 10 });
    expect(fields["game.extra.points"].leaderboard).toMatchObject({ name: "Game Points", limit: 50_000 });
    expect(fields["game.title"].leaderboard.enabled).toBe(false);
    expect(fields["game.title"].store.default).toBe("none");
    expect(fields["game.overall.tags"].store.default).toBe("");
    expect(fields["game.overall.seen"].store).toMatchObject({ required: false, default: false });
  });
}
