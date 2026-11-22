/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

declare module "mojangson" {
  interface Compound {
    type: "compound";
    value: Record<string, Tag>;
  }

  type Tag =
    | Compound
    | {
        type: "boolean" | "byte" | "short" | "int" | "long" | "float" | "double" | "string";
        value: unknown;
      }
    | { type: "list" | "byteArray" | "intArray" | "longArray"; value: { type: string; value: unknown[] } };

  export function parse(text: string): Tag;
  export function simplify(tag: Compound): Record<string, unknown>;
  export function simplify(tag: Tag): unknown;
}
