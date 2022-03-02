import { Injectable } from '@nestjs/common';
import { getLeaderboardField, Guild } from '@statsify/schemas';
import { flatten } from '@statsify/util';
import { MongoLeaderboardService } from '../../leaderboards';

@Injectable()
export class GuildLeaderboardService {
  public constructor(private readonly leaderboardService: MongoLeaderboardService) {}

  public async getLeaderboard(field: string, pageOrName: number | string) {
    let leaderboard: { index: number; data: Record<string, any> }[];

    const options = this.getFieldMetadata(field);
    const fieldName = options.name;

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
      fieldName,
      additionalFieldNames: ['Level'],
      data: leaderboard.map((guild) => {
        const flatGuild = flatten(guild.data);

        return {
          field: flatGuild[field],
          name: flatGuild.nameFormatted,
          additionalFields: [flatGuild.level],
          position: guild.index + 1,
        };
      }),
    };
  }

  public getFieldMetadata(field: string) {
    return getLeaderboardField(new Guild({}), field);
  }
}
