/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Player } from "@statsify/schemas";
import { UuidDto } from "./uuid.dto.js";
import { createZodDto } from "nestjs-zod";
import { leaderboardField } from "./leaderboard-field.js";
import { z } from "zod";

export class PlayerRankingsDto extends createZodDto(
  UuidDto.schema.extend({ fields: z.array(leaderboardField(Player)) })
) {}
