import { InjectModel } from '@m8a/nestjs-typegoose';
import { InjectRedis, Redis } from '@nestjs-modules/ioredis';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HypixelCache, LeaderboardQuery } from '@statsify/api-client';
import { LeaderboardEnabledMetadata, LeaderboardScanner, Player } from '@statsify/schemas';
import { flatten } from '@statsify/util';
import { ReturnModelType } from '@typegoose/typegoose';
import short from 'short-uuid';
import { LeaderboardService } from '../../leaderboards';
import { PlayerService } from '../player.service';

@Injectable()
export class PlayerLeaderboardService {
  public constructor(
    private readonly leaderboardService: LeaderboardService,
    @InjectRedis() private readonly redis: Redis,
    @InjectModel(Player) private readonly playerModel: ReturnModelType<typeof Player>,
    private readonly playerSerivce: PlayerService
  ) {}

  public async getLeaderboard(field: string, input: number | string, type: LeaderboardQuery) {
    const pageSize = 10;
    const translator = short(short.constants.cookieBase90);

    const {
      fieldName,
      additionalFields = [],
      extraDisplay,
      formatter,
      sort,
      name,
    } = LeaderboardScanner.getLeaderboardField(Player, field) as LeaderboardEnabledMetadata;

    let top: number;
    let bottom: number;
    let highlight: number | undefined = undefined;

    switch (type) {
      case LeaderboardQuery.PAGE:
        top = (input as number) * pageSize;
        bottom = top + pageSize;
        break;
      case LeaderboardQuery.PLAYER: {
        let tag = input as string;

        if (tag.length <= 16) {
          const player = await this.playerSerivce.get(tag, HypixelCache.CACHE_ONLY, { uuid: true });
          if (!player) return null;
          tag = player.uuid;
        }

        const shortUuid = translator.fromUUID(tag);
        const ranking = await this.getLeaderboardRanking(field, shortUuid, sort);

        if (ranking === null) return null;
        highlight = ranking;

        top = ranking - (ranking % 10);
        bottom = top + pageSize;
        break;
      }
      case LeaderboardQuery.POSITION: {
        const position = (input as number) - 1;
        highlight = position;

        top = position - (position % 10);
        bottom = top + pageSize;
        break;
      }
    }

    const leaderboard = await this.leaderboardService.getLeaderboard(
      Player,
      field,
      top,
      bottom - 1,
      sort
    );

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

      const field = formatter ? formatter(player.score) : player.score;

      const additionalValues = additionalFields.map((key, index) => {
        if (additionalFieldMetadata[index].formatter)
          return additionalFieldMetadata[index].formatter?.(stats[key]);

        return stats[key];
      });

      return {
        uuid: translator.toUUID(player.id).replace(/-/g, ''),
        fields: [field, ...additionalValues],
        name,
        position: player.index + 1,
        highlight: player.index === highlight,
      };
    });

    return {
      name: name,
      fields: [fieldName, ...additionalFieldMetadata.map(({ fieldName }) => fieldName)],
      data,
      page: top / pageSize,
    };
  }

  public async getLeaderboardRankings(fields: string[], uuid: string) {
    const translator = short(short.constants.cookieBase90);

    const shortUuid = translator.fromUUID(uuid);

    const pipeline = this.redis.pipeline();

    fields.forEach((field) => {
      if (LeaderboardScanner.getLeaderboardField(Player, field).sort === 'ASC')
        pipeline.zrank(`${Player.name.toLowerCase()}.${field}`, shortUuid);
      else pipeline.zrevrank(`${Player.name.toLowerCase()}.${field}`, shortUuid);
    });

    const responses = await pipeline.exec();

    if (!responses) throw new InternalServerErrorException();

    return responses.map((response, index) => {
      const field = fields[index];
      const rank = Number(response[1] ?? -1) + 1;

      return { field, rank };
    });
  }

  public async getLeaderboardRanking(field: string, uuid: string, sort?: 'ASC' | 'DESC') {
    return this.leaderboardService.getLeaderboardRanking(Player, field, uuid, sort);
  }

  public async fetchPlayerStats(uuids: string[], selector: string[]) {
    const select = Object.fromEntries(selector.map((key) => [key, 1]));

    const players = (await Promise.all(
      uuids.map((uuid) =>
        this.playerModel.findOne().where('shortUuid').equals(uuid).select(select).lean().exec()
      )
    )) as Player[];

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
