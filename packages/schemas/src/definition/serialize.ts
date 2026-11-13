/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type Flatten, flatten, unflatten } from "@statsify/util";
import { compute } from "./compute.js";
import { getFields } from "./fields.js";
import { roundTo } from "@statsify/math";
import type { ObjectSchema, s } from "./s.js";

/** The flattened values to write: undefined and default values are left out */
export function serialize<S extends ObjectSchema>(
  schema: S,
  flat: Flatten<s.infer<S>>
): Flatten<s.infer<S>> {
  const serialized: Record<string, unknown> = {};

  for (const { path, store } of getFields(schema)) {
    if (!store.store) continue;

    if (!store.serialize) {
      serialized[path] = flat[path];
      continue;
    }

    if (flat[path] === undefined || flat[path] === store.default) continue;
    serialized[path] = flat[path];
  }

  return serialized as Flatten<s.infer<S>>;
}

/** Reads flattened values back with every default filled in and numbers rounded to two places */
export function deserialize<S extends ObjectSchema>(
  schema: S,
  flat: Flatten<s.infer<S>>
): s.infer<S> {
  const fields = getFields(schema);
  const filled: Record<string, unknown> = {};

  for (const { path, store } of fields) {
    filled[path] = store.deserialize && flat[path] === undefined ? store.default : flat[path];
  }

  // Computed values are built again from what was stored, so a changed formula reaches old documents
  const computed: Record<string, unknown> = flatten(
    compute(schema, unflatten(filled) as s.input<S>)
  );
  const deserialized: Record<string, unknown> = {};

  for (const { path, store } of fields) {
    const value = computed[path];
    deserialized[path] = store.deserialize && typeof value === "number" ? roundTo(value) : value;
  }

  return unflatten(deserialized) as s.infer<S>;
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
      return s.computed((count) => count * 2, [this.count]);
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
    });

    expect(serialized).toEqual({ title: "title", unranked: 3 });

    expect(deserialize(Tester, { ...serialized, count: 1.234_56, double: 99 })).toEqual({
      title: "title",
      count: 1.23,
      unranked: 3,
      cached: false,
      nested: { count: 0 },
      double: 2.47,
    });
  });
}
