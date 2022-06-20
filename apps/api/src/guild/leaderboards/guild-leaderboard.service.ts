/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Injectable } from '@nestjs/common';
import { Guild, LeaderboardScanner } from '@statsify/schemas';
import { flatten } from '@statsify/util';
import { MongoLeaderboardService } from '../../leaderboards';

@Injectable()
export class GuildLeaderboardService {
  public constructor(private readonly leaderboardService: MongoLeaderboardService) {}

  public async getLeaderboard(field: string, pageOrName: number | string) {
    let leaderboard: { index: number; data: Record<string, any> }[];

    const { name, fieldName } = LeaderboardScanner.getLeaderboardField(Guild, field);

    const selector = {
      [field]: true,
      nameFormatted: true,
      nameToLower: true,
      level: true,
    };

    if (typeof pageOrName === 'number') {
      const page = pageOrName;
      const pageSize = 10;
      const top = page * pageSize;
      const bottom = top + pageSize;

      leaderboard = await this.leaderboardService.getLeaderboard(
        Guild,
        field,
        selector,
        top,
        bottom
      );
    } else {
      const name = pageOrName;

      const lbData = await this.leaderboardService.getLeaderboard(Guild, field, selector, {
        nameToLower: name.toLowerCase(),
      });

      if (!lbData) return null;

      leaderboard = lbData;
    }

    return {
      fields: [fieldName, 'Level'],
      name,
      data: leaderboard.map((guild) => {
        const flatGuild = flatten(guild.data);

        return {
          fields: [flatGuild[field], flatGuild.level],
          name: flatGuild.nameFormatted,
          position: guild.index + 1,
        };
      }),
    };
  }

  public async getLeaderboardRanking(field: string, name: string) {
    const rank = await this.leaderboardService.getLeaderboardRanking(Guild, field, {
      nameToLower: name.toLowerCase(),
    });

    return {
      field,
      rank,
    };
  }
}
