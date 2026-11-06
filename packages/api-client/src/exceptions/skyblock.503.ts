/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiProperty } from "@nestjs/swagger";
import { ServiceUnavailableException } from "@nestjs/common";

export const SKYBLOCK_UNAVAILABLE_REASONS = ["throttled", "hypixel", "budget", "market"] as const;
export type SkyBlockUnavailableReason = (typeof SKYBLOCK_UNAVAILABLE_REASONS)[number];

/**
 * Nothing stored to serve instead. throttled: Hypixel answered 429. hypixel: it errored or timed out. budget: SkyBlock's
 * share of the key is spent. market: no prices, bazaar or items resource have been fetched yet.
 */
export class SkyBlockUnavailableException extends ServiceUnavailableException {
  @ApiProperty()
  public statusCode: number;

  @ApiProperty()
  public message: string;

  @ApiProperty()
  public error: string;

  @ApiProperty({ enum: SKYBLOCK_UNAVAILABLE_REASONS })
  public reason: SkyBlockUnavailableReason;

  @ApiProperty({ required: false, description: "Milliseconds until a retry can succeed, when known" })
  public retryAfter?: number;

  public constructor(reason: SkyBlockUnavailableReason, retryAfter?: number) {
    super({ statusCode: 503, error: "Service Unavailable", message: "skyblock", reason, retryAfter });
  }
}
