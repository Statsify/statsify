/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiProperty } from "@nestjs/swagger";
import { z } from "zod";

export class UuidDto {
  public static schema = z.object({ uuid: z.string().min(32).max(36) });

  @ApiProperty()
  public uuid: string;
}
