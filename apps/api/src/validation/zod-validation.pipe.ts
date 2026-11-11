/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type ArgumentMetadata, BadRequestException, type PipeTransform } from "@nestjs/common";
import type { ZodType } from "zod";

export class ZodValidationPipe implements PipeTransform {
  public transform(value: unknown, { metatype }: ArgumentMetadata) {
    const schema = (metatype as { schema?: ZodType } | undefined)?.schema;
    if (!schema) return value;

    const result = schema.safeParse(value ?? {});
    if (result.success) return result.data;

    throw new BadRequestException(
      result.error.issues.map(({ path, message }) =>
        path.length > 0 ? `${path.join(".")}: ${message}` : message
      )
    );
  }
}
