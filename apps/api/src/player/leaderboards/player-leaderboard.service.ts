import { InjectModel } from '@m8a/nestjs-typegoose';
import { InjectRedis, Redis } from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';
import { getLeaderboardField, Player } from '@statsify/schemas';
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
    const translator = short(short.constants.cookieBase90);

    let top: number;
    let bottom: number;

    if (typeof pageOrUuid === 'number') {
      top = pageOrUuid * pageSize;
      bottom = top + pageSize;
    } else {
      const shortUuid = translator.fromUUID(pageOrUuid);
      const ranking = await this.getLeaderboardRanking(field, shortUuid);

      if (ranking === null) {
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

    const options = this.getFieldMetadata(field);
    const fieldName = options.name;
    const additionalFields = options.additionalFields as PlayerKeys[];
    const extraDisplay = options.extraDisplay;

    const additionalStats = await this.fetchPlayerStats(
      leaderboard.map(({ id }) => id),
      ['displayName', ...additionalFields, ...(extraDisplay ? [extraDisplay] : [])] as PlayerKeys[]
    );

    const data = leaderboard.map((player, index) => {
      const stats = additionalStats[index];
      let name = stats.displayName;

      if (extraDisplay) {
        name = `${stats[extraDisplay]} ${name}`;
      }

      return {
        uuid: translator.toUUID(player.id).replace(/-/g, ''),
        field: player.score,
        additionalFields: additionalFields.map((key) => stats[key]),
        name,
        position: player.index + 1,
      };
    });

    const additionalFieldNames = additionalFields.map((key) => this.getFieldMetadata(key).name);

    return { additionalFieldNames, fieldName, data };
  }

  public async getLeaderboardRanking(field: PlayerKeys, uuid: string) {
    return this.leaderboardService.getLeaderboardRanking(Player, field, uuid);
  }

  public async fetchPlayerStats(uuids: string[], selector: PlayerKeys[]) {
    const select = Object.fromEntries(selector.map((key) => [key, 1]));

    const players = await Promise.all(
      uuids.map((uuid) =>
        this.playerModel.findOne().where('shortUuid').equals(uuid).select(select).lean().exec()
      )
    );

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

  public getFieldMetadata(field: PlayerKeys) {
    return getLeaderboardField(new Player(), field);
  }
}
