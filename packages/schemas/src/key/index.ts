/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiProperty } from '@nestjs/swagger';

export class Key {
  @ApiProperty()
  public name: string;

  @ApiProperty()
  public lifetimeRequests: number;

  @ApiProperty()
  public recentRequests: number;

  @ApiProperty()
  public resetTime: number;

  @ApiProperty()
  public limit: number;
}
