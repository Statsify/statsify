/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Player } from "@statsify/schemas";
import { PlayerDto } from "./player.dto.js";
import { createZodDto } from "nestjs-zod";
import { leaderboardField } from "./leaderboard-field.js";
import { z } from "zod";

export class PlayerLeaderboardDto extends createZodDto(
  z.object({
    player: PlayerDto.schema.shape.player.nullish(),
    field: leaderboardField(Player),
    page: z.coerce.number().int().min(0).default(0),
    position: z.coerce.number().int().min(1).optional(),
  })
) {}
