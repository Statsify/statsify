/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiProperty } from "@nestjs/swagger";

export class RawHypixelPlayerResponse {
  @ApiProperty()
  public success: boolean;

  @ApiProperty({
    type: "object",
    nullable: true,
    additionalProperties: true,
  })
  public player: Record<string, unknown> | null;
}

export class RawHypixelGuildResponse {
  @ApiProperty()
  public success: boolean;

  @ApiProperty({
    type: "object",
    nullable: true,
    additionalProperties: true,
  })
  public guild: Record<string, unknown> | null;
}

export class RawHypixelWatchdogStatsResponse {
  @ApiProperty({
    description: "The raw Hypixel response includes additional top-level watchdog stats fields.",
  })
  public success: boolean;
}

export class RawHypixelGamecountsResponse {
  @ApiProperty()
  public success: boolean;

  @ApiProperty({
    type: "object",
    additionalProperties: true,
  })
  public games: Record<string, unknown>;
}
