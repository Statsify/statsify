/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiProperty } from '@nestjs/swagger';

class GuildLeaderboardItem {
  @ApiProperty({ type: [Number], description: 'The leaderboard fields returned' })
  public fields: number[];

  @ApiProperty({
    description: "The guild's formatted name with tag",
  })
  public name: string;

  @ApiProperty()
  public position: number;
}

export class PostGuildLeaderboardResponse {
  @ApiProperty({ type: [String] })
  public fields: string[];

  @ApiProperty({ type: [GuildLeaderboardItem] })
  public data: GuildLeaderboardItem[];

  @ApiProperty()
  public name: string;
}
