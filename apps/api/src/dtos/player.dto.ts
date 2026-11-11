/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiProperty } from "@nestjs/swagger";
import { z } from "zod";

export class PlayerDto {
  public static schema = z.object({ player: z.string().min(1).max(36) });

  @ApiProperty({
    example: "j4cobi",
    description: "The player's username or uuid",
  })
  public player: string;
}
