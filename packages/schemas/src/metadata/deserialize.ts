/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type Constructor, type Flatten, unflatten } from "@statsify/util";
import { MetadataScanner } from "./metadata-scanner.js";
import { roundTo } from "@statsify/math";
import type { FieldMetadata } from "./metadata.interface.js";

export const deserialize = <T>(constructor: Constructor<T>, instance: Flatten<T>): T => {
  const metadataEntries = MetadataScanner.scan(constructor) as [
    keyof Flatten<T>,
    FieldMetadata
  ][];

  const deserialized: Flatten<T> = {} as Flatten<T>;

  for (const [
    key,
    {
      store: { deserialize: shouldDeserialize, default: defaultValue },
    },
  ] of metadataEntries) {
    deserialized[key] = instance[key];

    //The value should not be processed
    if (!shouldDeserialize) continue;

    //If the value is undefined use the default value
    if (deserialized[key] === undefined) deserialized[key] = defaultValue;

    // If the value is numimercal round it to 2 digits of precision
    if (typeof deserialized[key] === "number")
      deserialized[key] = roundTo(deserialized[key] as unknown as number) as any;
  }

  //Unflatten the object to return the original type
  return unflatten(deserialized);
};

if (import.meta.vitest) {
  const { test, it, expect } = import.meta.vitest;
  const { flatten } = await import("@statsify/util");
  const { Field } = await import("./field/index.js");

  test("deserialize", () => {
    class TesterB {
      @Field()
      public field1: number;
    }

    class Tester {
      @Field()
      public field1: string;

      @Field()
      public field2: number;

      @Field({ leaderboard: { enabled: false } })
      public field3: number;

      @Field({ store: { store: false } })
      public field4: number;

      @Field()
      public field5: TesterB;

      public constructor() {
        this.field1 = "field1";
        this.field2 = 0;
        this.field3 = 3;
        this.field5 = new TesterB();
      }
    }

    it("should correctly add fields", () => {
      const result = deserialize(Tester, flatten(new Tester()));

      expect(result).toEqual({
        field1: "field1",
        field2: 0,
        field3: 3,
        field4: 0,
        field5: {
          field1: 0,
        },
      });
    });
  });
}
