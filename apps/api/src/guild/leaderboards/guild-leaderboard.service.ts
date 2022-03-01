import { Injectable } from '@nestjs/common';
import { getLeaderboardField, Guild } from '@statsify/schemas';
import { flatten } from '@statsify/util';
import { MongoLeaderboardService } from '../../leaderboards';

@Injectable()
export class GuildLeaderboardService {
  public constructor(private readonly leaderboardService: MongoLeaderboardService) {}

  public async getLeaderboard(field: string, page: number) {
    const pageSize = 10;
    const top = page * pageSize;
    const bottom = top + pageSize;

    const options = this.getFieldMetadata(field);
    const fieldName = options.name;

    const leaderboad = await this.leaderboardService.getLeaderboard(
      Guild,
      field,
      {
        [field]: true,
        nameFormatted: true,
        level: true,
      },
      top,
      bottom
    );

    return {
      fieldName,
      additionalFieldNames: ['Level'],
      data: leaderboad.map((guild) => {
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
