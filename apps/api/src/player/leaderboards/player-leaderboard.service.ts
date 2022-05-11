import { InjectModel } from '@m8a/nestjs-typegoose';
import { InjectRedis, Redis } from '@nestjs-modules/ioredis';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { LeaderboardEnabledMetadata, LeaderboardScanner, Player } from '@statsify/schemas';
import { flatten, FlattenKeys } from '@statsify/util';
import { ReturnModelType } from '@typegoose/typegoose';
import short from 'short-uuid';
import { LeaderboardService } from '../../leaderboards';

@Injectable()
export class PlayerLeaderboardService {
  public constructor(
    private readonly leaderboardService: LeaderboardService,
    @InjectRedis() private readonly redis: Redis,
    @InjectModel(Player) private readonly playerModel: ReturnModelType<typeof Player>
  ) {}

  public async getLeaderboard(field: FlattenKeys<Player>, pageOrUuid: number | string) {
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

    const {
      name: fieldName,
      additionalFields,
      extraDisplay,
      formatter,
    } = LeaderboardScanner.getLeaderboardField(Player, field) as LeaderboardEnabledMetadata & {
      additionalFields: FlattenKeys<Player>[];
      extraDisplay: FlattenKeys<Player>;
    };

    const additionalStats = await this.fetchPlayerStats(
      leaderboard.map(({ id }) => id),
      ['displayName', ...additionalFields, ...(extraDisplay ? [extraDisplay] : [])]
    );

    const additionalFieldMetadata = additionalFields.map((key) =>
      LeaderboardScanner.getLeaderboardField(Player, key)
    );

    const data = leaderboard.map((player, index) => {
      const stats = additionalStats[index];
      let name = stats.displayName;

      if (extraDisplay) name = `${stats[extraDisplay]} ${name}`;

      return {
        uuid: translator.toUUID(player.id).replace(/-/g, ''),
        field: formatter ? formatter(player.score) : player.score,
        additionalFields: additionalFields.map((key: FlattenKeys<Player>, index) => {
          if (additionalFieldMetadata[index].formatter)
            return additionalFieldMetadata[index].formatter?.(stats[key]);

          return stats[key];
        }),
        name,
        position: player.index + 1,
      };
    });

    return {
      additionalFieldNames: additionalFieldMetadata.map(({ name }) => name),
      fieldName,
      data,
    };
  }

  public async getLeaderboardRankings(fields: FlattenKeys<Player>[], uuid: string) {
    const translator = short(short.constants.cookieBase90);

    const shortUuid = translator.fromUUID(uuid);

    const pipeline = this.redis.pipeline();

    fields.forEach((field) => {
      pipeline.zrevrank(`${Player.name.toLowerCase()}.${field}`, shortUuid);
    });

    const responses = await pipeline.exec();

    if (!responses) throw new InternalServerErrorException();

    return responses.map((response, index) => {
      const field = fields[index];
      const rank = Number(response[1] ?? 0);

      return { field, rank };
    });
  }

  public async getLeaderboardRanking(field: FlattenKeys<Player>, uuid: string) {
    return this.leaderboardService.getLeaderboardRanking(Player, field, uuid);
  }

  public async fetchPlayerStats(uuids: string[], selector: FlattenKeys<Player>[]) {
    const select = Object.fromEntries(selector.map((key) => [key, 1]));

    const players = (await Promise.all(
      uuids.map((uuid) =>
        this.playerModel.findOne().where('shortUuid').equals(uuid).select(select).lean().exec()
      )
    )) as Player[];

    const pipeline = this.redis.pipeline();
    const name = Player.name.toLowerCase();

    const requests: [index: number, key: FlattenKeys<Player>][] = [];

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

    if (!responses) throw new InternalServerErrorException();

    responses.forEach((response, ind) => {
      const [index, key] = requests[ind];
      const flatPlayer = flatPlayers[index];

      //@ts-ignore Typescript doesn't know what the value should be for this key; However since it is a leaderboard field it has to be a number
      flatPlayer[key] = Number(response[1] ?? 0);
    });

    return flatPlayers;
  }
}
