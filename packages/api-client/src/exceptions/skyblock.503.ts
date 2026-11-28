/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiProperty } from "@nestjs/swagger";
import { ServiceUnavailableException } from "@nestjs/common";

export const SKYBLOCK_UNAVAILABLE_REASONS = [
  "throttled",
  "hypixel",
  "market",
] as const;

export type SkyBlockUnavailableReason =
  (typeof SKYBLOCK_UNAVAILABLE_REASONS)[number];

export class SkyBlockUnavailableException extends ServiceUnavailableException {
  @ApiProperty()
  public statusCode: number;

  @ApiProperty()
  public message: string;

  @ApiProperty()
  public error: string;

  @ApiProperty({
    enum: SKYBLOCK_UNAVAILABLE_REASONS,
    description:
      "throttled: Hypixel answered 429. hypixel: it failed or timed out. market: no prices, bazaar or items resource yet, or the item search failed.",
  })
  public reason: SkyBlockUnavailableReason;

  @ApiProperty({
    required: false,
    description: "Milliseconds until a retry can succeed, when known",
  })
  public retryAfter?: number;

  public constructor(reason: SkyBlockUnavailableReason, retryAfter?: number) {
    super({
      statusCode: 503,
      error: "Service Unavailable",
      message: "skyblock",
      reason,
      retryAfter,
    });
  }
}
