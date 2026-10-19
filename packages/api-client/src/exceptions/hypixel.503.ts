/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiProperty } from "@nestjs/swagger";
import { ServiceUnavailableException } from "@nestjs/common";

export class HypixelUnavailableException extends ServiceUnavailableException {
  @ApiProperty()
  public statusCode: number;

  @ApiProperty()
  public message: string;

  @ApiProperty()
  public error: string;

  public constructor() {
    super({
      statusCode: 503,
      error: "Service Unavailable",
      message: "hypixel",
    });
  }
}
