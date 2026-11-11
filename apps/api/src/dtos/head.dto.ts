/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiProperty } from "@nestjs/swagger";
import { UuidDto } from "./uuid.dto.js";
import { z } from "zod";

export class HeadDto extends UuidDto {
  public static override schema = UuidDto.schema.extend({
    size: z.coerce.number().int().min(8).max(800).default(160),
  });

  @ApiProperty({
    description: "The size of the head",
    default: 160,
    minimum: 8,
    maximum: 800,
  })
  public size: number;
}
