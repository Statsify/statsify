/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiProperty } from "@nestjs/swagger";
import { z } from "zod";

export class UserIdDto {
  public static schema = z.object({ id: z.string().min(17).max(20) });

  @ApiProperty({ description: "Discord ID" })
  public id: string;
}

export class UserDto {
  public static schema = z.object({ tag: z.string().min(17).max(36) });

  @ApiProperty({ description: "Discord ID or UUID" })
  public tag: string;
}

export class UpdateUserDto {
  // Admin callers can set any other User field through this body too
  public static schema = z.looseObject({
    serverMember: z.boolean().nullish(),
    theme: z.object({
      font: z.string().nullish(),
      palette: z.string().nullish(),
      boxes: z.string().nullish(),
    }).optional(),
    footer: z.object({
      message: z.string().nullish(),
      icon: z.number().nullish(),
    }).optional(),
    locale: z.string().nullish(),
  });

  public serverMember?: boolean;

  public theme?: { font?: string; palette?: string; boxes?: string };

  public footer?: { message?: string; icon?: number };

  public locale?: string;
}
