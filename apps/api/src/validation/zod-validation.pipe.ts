/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type ArgumentMetadata, BadRequestException, type PipeTransform } from "@nestjs/common";
import { ZodNumber, type ZodType, type z } from "zod";

const TYPE_MESSAGES: Partial<Record<string, string>> = {
  string: "must be a string",
  int: "must be an integer number",
  number: "must be a number conforming to the specified constraints",
  boolean: "must be a boolean value",
  array: "must be an array",
  object: "must be an object",
};

// The wording class-validator used, which API clients already see in error responses
const classValidatorMessage: z.core.$ZodErrorMap = (issue) => {
  switch (issue.code) {
    case "invalid_type":
      // Zod reports NaN as "expected number" even on an int schema
      return issue.inst instanceof ZodNumber && issue.inst.format === "safeint" ?
        TYPE_MESSAGES.int :
        TYPE_MESSAGES[issue.expected];

    // Zod also runs a string's length checks on a repeated query param, which arrives as an array
    case "too_small":
      return issue.origin === "number" ?
        `must not be less than ${issue.minimum}` :
        `must be longer than or equal to ${issue.minimum} characters`;

    case "too_big":
      return issue.origin === "number" ?
        `must not be greater than ${issue.maximum}` :
        `must be shorter than or equal to ${issue.maximum} characters`;

    case "invalid_value":
      return `must be one of the following values: ${issue.values.join(", ")}`;

    default:
      return undefined;
  }
};

const formatIssue = ({ path, message }: z.core.$ZodIssue) => {
  const each = typeof path.at(-1) === "number";
  const property = (each ? path.slice(0, -1) : path).join(".");
  return `${each ? "each value in " : ""}${property} ${message}`;
};

export class ZodValidationPipe implements PipeTransform {
  public transform(value: unknown, { metatype }: ArgumentMetadata) {
    const schema = (metatype as { schema?: ZodType } | undefined)?.schema;
    if (!schema) return value;

    // Nest's ValidationPipe validated a missing body as an empty object
    const result = schema.safeParse(value ?? {}, { error: classValidatorMessage });
    if (result.success) return result.data;

    throw new BadRequestException([...new Set(result.error.issues.map(formatIssue))]);
  }
}
