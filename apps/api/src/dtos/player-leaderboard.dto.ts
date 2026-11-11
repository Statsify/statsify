/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiProperty, PartialType } from "@nestjs/swagger";
import { Player } from "@statsify/schemas";
import { PlayerDto } from "./player.dto.js";
import { leaderboardField } from "./leaderboard-field.js";
import { z } from "zod";

const field = leaderboardField(Player);

export class PlayerLeaderboardDto extends PartialType(PlayerDto) {
  public static schema = z.object({
    player: PlayerDto.schema.shape.player.nullish(),
    field,
    page: z.coerce.number().int().min(0).default(0),
    position: z.coerce.number().int().min(1).optional(),
  });

  @ApiProperty({ enum: field.options })
  public field: string;

  @ApiProperty({ default: 0, minimum: 0, type: () => Number, required: false })
  public page: number;

  @ApiProperty({ minimum: 1, type: () => Number, required: false })
  public position?: number;
}
