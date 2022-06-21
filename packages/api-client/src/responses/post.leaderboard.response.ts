/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiProperty } from '@nestjs/swagger';

export class LeaderboardItem {
  @ApiProperty()
  public id: string;

  @ApiProperty({ type: [Number], description: 'The leaderboard fields returned', isArray: true })
  public fields: number[];

  @ApiProperty({
    description:
      "The player's formatted name, it also includes prefixes like bedwars star or duels title",
  })
  public name: string;

  @ApiProperty()
  public position: number;

  @ApiProperty({ required: false, description: 'Whether the player was the searched for player' })
  public highlight?: boolean;
}

export class PostLeaderboardResponse {
  @ApiProperty({ type: [String], description: 'The name of the requested leaderboard fields' })
  public fields: string[];

  @ApiProperty({ type: [LeaderboardItem] })
  public data: LeaderboardItem[];

  @ApiProperty()
  public page: number;

  @ApiProperty()
  public name: string;
}
