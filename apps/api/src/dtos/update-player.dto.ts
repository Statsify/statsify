/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiProperty } from "@nestjs/swagger";
import { z } from "zod";

export class UpdatePlayerDto {
  // The body is the whole Hypixel player, so every other key has to reach `new Player()`
  public static schema = z.looseObject({
    uuid: z.string(),
    playername: z.string(),
    displayname: z.string(),
  });

  @ApiProperty()
  public uuid: string;

  @ApiProperty()
  public playername: string;

  @ApiProperty()
  public displayname: string;
}
