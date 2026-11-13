/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Schema, type SchemaDefinition } from "mongoose";
import { isStored } from "./fields.js";
import type { AnySchema, ObjectSchema } from "./s.js";

const getType = (field: AnySchema): unknown => {
  switch (field.kind) {
    case "number":
    case "ratio":
      return Number;
    case "string":
      return String;
    case "boolean":
      return Boolean;
    case "array":
      return [getType(field.element)];
    case "object":
      return toMongoose(field);
  }
};

export function toMongoose(schema: ObjectSchema): Schema {
  const definition: SchemaDefinition = {};

  for (const [key, field] of Object.entries(schema.definition)) {
    if (!isStored(field)) continue;

    const { optional, index, lowercase } = field.meta;

    definition[key] = {
      type: getType(field),
      required: !optional,
      ...(index && { index: true, ...index }),
      ...(lowercase && { lowercase }),
    };
  }

  // Stored documents and their nested objects have never had an `_id`
  return new Schema(definition, { _id: false });
}
