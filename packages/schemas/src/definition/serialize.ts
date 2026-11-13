/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type Field, getFields } from "./fields.js";
import type { Flatten } from "@statsify/util";
import { compute } from "./compute.js";
import { roundTo } from "@statsify/math";
import type { ObjectSchema, s } from "./s.js";

type Values = Record<string, any>;

// Every API read deserializes a whole player, and unflatten splitting each path again was most of its time
const splitFields = new WeakMap<ObjectSchema, [Field, string[]][]>();

function getSplitFields(schema: ObjectSchema) {
  let fields = splitFields.get(schema);

  if (!fields) {
    fields = getFields(schema).map((field) => [field, field.path.split(".")]);
    splitFields.set(schema, fields);
  }

  return fields;
}

function setPath(target: Values, keys: string[], value: unknown) {
  let parent = target;
  for (let index = 0; index < keys.length - 1; index++) parent = parent[keys[index]] ??= {};
  parent[keys.at(-1)!] = value;
}

function getPath(source: Values, keys: string[]) {
  let value: any = source;
  for (const key of keys) value = value?.[key];
  return value;
}

/** The flattened values to write: undefined and default values are left out */
export function serialize<S extends ObjectSchema>(
  schema: S,
  flat: Flatten<s.infer<S>>
): Flatten<s.infer<S>> {
  const serialized: Record<string, unknown> = {};

  for (const { path, store } of getFields(schema)) {
    if (!store.store) continue;
    if (store.serialize && (flat[path] === undefined || flat[path] === store.default)) continue;

    serialized[path] = flat[path];
  }

  return serialized as Flatten<s.infer<S>>;
}

/** Reads flattened values back with every default filled in and numbers rounded to two places */
export function deserialize<S extends ObjectSchema>(
  schema: S,
  flat: Flatten<s.infer<S>>
): s.infer<S> {
  const fields = getSplitFields(schema);
  const filled: Values = {};

  for (const [{ path, store }, keys] of fields) {
    const value = (flat as Values)[path];
    setPath(filled, keys, store.deserialize && value === undefined ? store.default : value);
  }

  // Computed values are built again from what was stored, so a changed formula reaches old documents
  const computed = compute(schema, filled as s.input<S>);
  const deserialized: Values = {};

  for (const [{ store }, keys] of fields) {
    // A computed value can be missing too, like a progression's max past the last tier
    let value = getPath(computed, keys);
    if (store.deserialize && value === undefined) value = store.default;
    setPath(deserialized, keys, store.deserialize && typeof value === "number" ? roundTo(value) : value);
  }

  return deserialized as s.infer<S>;
}

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;
  const { s } = await import("./s.js");

  const Tester = s.object({
    title: s.string(),
    count: s.number(),
    unranked: s.number().leaderboard(false),
    cached: s.boolean().store(false),
    nested: s.object({ count: s.number() }),
    double() {
      return s.number().computed((count) => count * 2, [this.count]);
    },
    tier() {
      return s
        .object({ max: s.number().optional() })
        .computed((count) => (count < 1 ? { max: 1 } : {}), [this.count]);
    },
  });

  it("drops defaults on the way in, and fills them and recomputes on the way out", () => {
    const serialized = serialize(Tester, {
      title: "title",
      count: 0,
      unranked: 3,
      cached: true,
      "nested.count": undefined,
      double: 0,
      "tier.max": undefined,
    });

    expect(serialized).toEqual({ title: "title", unranked: 3 });

    expect(deserialize(Tester, { ...serialized, count: 1.234_56, double: 99 })).toEqual({
      title: "title",
      count: 1.23,
      unranked: 3,
      cached: false,
      nested: { count: 0 },
      double: 2.47,
      tier: { max: 0 },
    });
  });
}
