/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { isObject } from "@statsify/util";
import { ratio, sub } from "@statsify/math";
import type { ObjectSchema, s } from "./s.js";

/** Fills in every computed field, so it runs again after values are added or subtracted */
export function compute<S extends ObjectSchema>(schema: S, input: s.input<S>): s.infer<S> {
  const values = input as Record<string, any>;
  const output: Record<string, unknown> = {};

  for (const [key, field] of Object.entries(schema.definition)) {
    const value = values[key];

    switch (field.kind) {
      case "ratio":
        output[key] = ratio(values[field.numerator], values[field.denominator], field.multiplier);
        break;

      case "object":
        output[key] = value === undefined ? value : compute(field, value);
        break;

      case "array":
        output[key] =
          field.element.kind === "object" ?
            value?.map((element: object) => compute(field.element, element)) :
            value;
        break;

      default:
        output[key] = value;
    }
  }

  return output as s.infer<S>;
}

/** The stats gained between two copies, as `/session` shows them */
export function diff<S extends ObjectSchema>(
  schema: S,
  before: s.infer<S>,
  after: s.infer<S>
): s.infer<S> {
  return compute(schema, subtract(schema, before, after) as s.input<S>);
}

function subtract(schema: ObjectSchema, before: Record<string, any>, after: Record<string, any>) {
  const gained: Record<string, unknown> = {};

  for (const [key, field] of Object.entries(schema.definition)) {
    if (field.kind === "ratio") continue;

    if (typeof before[key] === "number" || typeof after[key] === "number") {
      gained[key] = sub(after[key], before[key]);
    } else if (typeof after[key] === "string") {
      gained[key] = after[key];
    } else if (isObject(after[key]) && field.kind === "object") {
      // Progress toward the next level isn't a difference, so it's the latest one
      gained[key] =
        key === "progression" ? after[key] : subtract(field, before[key] ?? {}, after[key]);
    }
  }

  return gained;
}

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;
  const { s } = await import("./s.js");
  const { deepAdd } = await import("@statsify/math");

  const Mode = s.object({
    wins: s.number(),
    losses: s.number(),
    wlr() {
      return s.ratio(this.wins, this.losses);
    },
  });

  const Game = s.object({
    title: s.string(),
    progression: s.object({ current: s.number(), percent: s.number() }),
    overall: Mode,
  });

  it("computes ratios from inputs that were added or subtracted", () => {
    expect(compute(Mode, deepAdd({ wins: 3, losses: 1 }, { wins: 1, losses: 3 }))).toEqual({
      wins: 4,
      losses: 4,
      wlr: 1,
    });

    const before = { title: "a", progression: { current: 5, percent: 0.5 }, overall: { wins: 10, losses: 10, wlr: 1 } };
    const after = { title: "b", progression: { current: 2, percent: 0.2 }, overall: { wins: 13, losses: 11, wlr: 1.18 } };

    expect(diff(Game, before, after)).toEqual({
      title: "b",
      progression: { current: 2, percent: 0.2 },
      overall: { wins: 3, losses: 1, wlr: 3 },
    });
  });
}
