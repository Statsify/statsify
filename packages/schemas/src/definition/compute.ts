/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { isObject } from "@statsify/util";
import { sub } from "@statsify/math";
import type { AnySchema, Definition, Dependency, ObjectSchema, s } from "./s.js";

type Values = Record<string, any>;

/** Reads a path in each object around the one being computed, by its definition */
type Scopes = Map<Definition, (path: string) => unknown>;

/** Fills in every computed field from its dependencies, including ones that depend on other computed fields */
export function compute<S extends ObjectSchema>(
  schema: S,
  input: s.input<S>,
  shouldCompute: (field: AnySchema) => boolean = () => true,
  around: Scopes = new Map()
): s.infer<S> {
  const values = input as Values;
  const entries = Object.entries(schema.definition as Record<string, AnySchema>);
  const output: Values = Object.fromEntries(entries.map(([key]) => [key, undefined]));
  const done = new Set<string>();

  const get = (key: string): unknown => {
    if (done.has(key)) return output[key];

    const field = schema.definition[key] as AnySchema;
    const value = values[key];
    const { computed } = field.meta;

    if (computed && shouldCompute(field)) {
      output[key] = computed.compute(...computed.dependencies.map(readDependency));
    } else if (field.kind === "object") {
      output[key] = value === undefined ? value : compute(field, value, shouldCompute, scopes);
    } else if (field.kind === "array" && field.element.kind === "object") {
      output[key] = value?.map((element: object) =>
        compute(field.element, element, shouldCompute, scopes)
      );
    } else {
      output[key] = value;
    }

    done.add(key);
    return output[key];
  };

  const read = (path: string) => {
    const [key, ...rest] = path.split(".");
    return rest.reduce<any>((value, part) => value?.[part], get(key));
  };

  const scopes: Scopes = new Map(around).set(schema.definition, read);

  const readDependency = ({ scope, path }: Dependency) => {
    const readScope = scopes.get(scope);
    if (!readScope) throw new Error(`"${path}" is read from an object that isn't around this one`);
    return readScope(path);
  };

  for (const [key] of entries) get(key);

  return output as s.infer<S>;
}

/** The stats gained between two copies, as `/session` shows them */
export function diff<S extends ObjectSchema>(
  schema: S,
  before: s.infer<S>,
  after: s.infer<S>
): s.infer<S> {
  // A ratio of what was gained is the session's ratio, while a level is shown as levels gained
  return compute(
    schema,
    subtract(schema, before, after) as s.input<S>,
    (field) => field.kind === "number" && !field.meta.subtractInSessions
  );
}

function subtract(schema: ObjectSchema, before: Values, after: Values) {
  const gained: Values = {};

  for (const [key, field] of Object.entries(schema.definition as Record<string, AnySchema>)) {
    if (typeof before[key] === "number" || typeof after[key] === "number") {
      gained[key] = sub(after[key], before[key]);
    } else if (typeof after[key] === "string") {
      gained[key] = after[key];
    } else if (isObject(after[key]) && field.kind === "object") {
      gained[key] = field.meta.computed ? after[key] : subtract(field, before[key] ?? {}, after[key]);
    }
  }

  return gained;
}

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;
  const { s } = await import("./s.js");
  const { deepAdd, ratio } = await import("@statsify/math");

  const Mode = s.object({
    wins: s.number(),
    losses: s.number(),
    wlr() {
      return s.number().computed(ratio, [this.wins, this.losses]);
    },
  });

  const Game = s.object({
    exp: s.number(),
    level() {
      return s.number().computed((exp) => exp / 100, [this.exp]).subtractInSessions();
    },
    title() {
      return s.string().computed((level) => `[${Math.floor(level)}]`, [this.level]);
    },
    progression() {
      return s.object({ current: s.number() }).computed((exp) => ({ current: exp % 100 }), [this.exp]);
    },
    overall: Mode,
  });

  it("computes fields from their dependencies, after inputs are added or subtracted", () => {
    expect(compute(Mode, deepAdd({ wins: 3, losses: 1 }, { wins: 1, losses: 3 }))).toEqual({
      wins: 4,
      losses: 4,
      wlr: 1,
    });

    const before = compute(Game, { exp: 250, overall: { wins: 10, losses: 10 } });
    const after = compute(Game, { exp: 450, overall: { wins: 13, losses: 11 } });

    expect(after).toEqual({
      exp: 450,
      level: 4.5,
      title: "[4]",
      progression: { current: 50 },
      overall: { wins: 13, losses: 11, wlr: 1.18 },
    });

    expect(diff(Game, before, after)).toEqual({
      exp: 200,
      level: 2,
      title: "[4]",
      progression: { current: 50 },
      overall: { wins: 3, losses: 1, wlr: 3 },
    });
  });

  it("reads a field of an object around it through refs passed down", () => {
    const Profile = s.object({
      icon: s.string(),
      mode() {
        const { icon } = this;

        return s.object({
          wins: s.number(),
          title() {
            return s.string().computed((wins, icon) => `${icon} ${wins}`, [this.wins, icon]);
          },
        });
      },
    });

    expect(compute(Profile, { icon: "✫", mode: { wins: 5 } })).toEqual({
      icon: "✫",
      mode: { wins: 5, title: "✫ 5" },
    });
  });
}
