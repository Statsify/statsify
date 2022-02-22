import { InjectModel } from '@m8a/nestjs-typegoose';
import { InjectRedis, Redis } from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';
import { Player } from '@statsify/schemas';
import { flatten } from '@statsify/util';
import { ReturnModelType } from '@typegoose/typegoose';
import short from 'short-uuid';
import { LeaderboardService } from '../../leaderboards';
import { PlayerKeys } from '../player.select';

@Injectable()
export class PlayerLeaderboardService {
  public constructor(
    private readonly leaderboardService: LeaderboardService,
    @InjectRedis() private readonly redis: Redis,
    @InjectModel(Player) private readonly playerModel: ReturnModelType<typeof Player>
  ) {}

  public async getLeaderboard(field: PlayerKeys, pageOrUuid: number | string) {
    const pageSize = 10;

    let top: number;
    let bottom: number;

    if (typeof pageOrUuid === 'number') {
      const page = pageOrUuid;
      top = page * pageSize;
      bottom = top + pageSize;
    } else {
      const uuid = pageOrUuid;
      const ranking = await this.getLeaderboardRanking(field, uuid);

      if (!ranking) {
        return null;
      }

      const halfPage = pageSize / 2;
      top = ranking < halfPage ? 0 : ranking - halfPage;
      bottom = ranking < halfPage ? pageSize : ranking + halfPage;
    }

    const leaderboard = await this.leaderboardService.getLeaderboard(
      Player,
      field,
      top,
      bottom - 1
    );

    //TODO(jacobk999): Make these come from the leaderboard being requested
    const fields: PlayerKeys[] = ['stats.bedwars.overall.kills', 'stats.bedwars.overall.deaths'];

    const additionalStats = await this.fetchPlayerStats(
      leaderboard.map(({ id }) => id),
      fields
    );

    const translator = short(short.constants.cookieBase90);

    const data = leaderboard.map((player, index) => {
      const stats = additionalStats[index];

      return {
        uuid: translator.toUUID(player.id).replace(/-/g, ''),
        field: player.score,
        additionalFields: fields.map((key) => stats[key]),
        position: player.index + 1,
      };
    });

    return { additionalFieldNames: fields, fieldName: field, data };
  }

  public async getLeaderboardRanking(field: PlayerKeys, uuid: string) {
    return this.leaderboardService.getLeaderboardRanking(Player, field, uuid);
  }

  public async fetchPlayerStats(uuids: string[], selector: PlayerKeys[]) {
    const select = Object.fromEntries(selector.map((key) => [key, 1]));

    const players = await this.playerModel
      .find()
      .where('shortUuid')
      .in(uuids)
      .select(select)
      .lean()
      .exec();

    const pipeline = this.redis.pipeline();
    const name = Player.name.toLowerCase();

    const requests: [index: number, key: string][] = [];

    const flatPlayers = players.map((player, index) => {
      const flat = flatten(player);
      selector.forEach((key) => {
        if (!flat[key]) {
          pipeline.zscore(`${name}.${key}`, uuids[index]);
          requests.push([index, key]);
        }
      });

      return flat;
    });

    const responses = await pipeline.exec();

    responses.forEach((response, ind) => {
      const [index, key] = requests[ind];
      flatPlayers[index][key] = Number(response[1] ?? 0);
    });

    return flatPlayers;
  }
}
