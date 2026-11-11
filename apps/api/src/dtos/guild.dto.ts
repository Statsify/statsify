/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiProperty } from "@nestjs/swagger";
import { CacheDto } from "./cache.dto.js";
import { GuildQuery } from "@statsify/api-client";
import { z } from "zod";

export class GuildDto extends CacheDto {
  public static override schema = CacheDto.schema.extend({
    guild: z.string().min(1).max(36),
    type: z.enum(GuildQuery),
  });

  @ApiProperty({
    example: "bluebloods",
    description: "The guild's name or id or a guild member's uuid",
  })
  public guild: string;

  @ApiProperty({
    enum: GuildQuery,
    enumName: "GuildQuery",
    example: GuildQuery.ID,
    description:
      "The way you want to query the guild, either search by the name, the uuid of a guild member or the guild id",
  })
  public type: GuildQuery;
}
