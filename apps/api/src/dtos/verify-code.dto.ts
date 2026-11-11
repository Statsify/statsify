/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiProperty, PartialType } from "@nestjs/swagger";
import { UuidDto } from "./uuid.dto.js";
import { z } from "zod";

export class VerifyCodeDto extends PartialType(UuidDto) {
  public static schema = z.object({
    uuid: UuidDto.schema.shape.uuid.optional(),
    id: z.string().min(17),
    code: z.string().length(4).optional(),
  });

  @ApiProperty({ description: "Discord ID" })
  public id: string;

  @ApiProperty({ description: "Verification Code" })
  public code?: string;
}
