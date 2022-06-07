import { InjectModel } from '@m8a/nestjs-typegoose';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { HistoricalType, HypixelCache } from '@statsify/api-client';
import { ratio, sub } from '@statsify/math';
import { deserialize, Player, serialize } from '@statsify/schemas';
import { Flatten, flatten } from '@statsify/util';
import { ReturnModelType } from '@typegoose/typegoose';
import { isObject } from 'class-validator';
import { PlayerService } from '../player';
import { Daily, LastDay, LastMonth, LastWeek, Monthly, Weekly } from './models';

const RATIOS = ['wlr', 'kdr', 'fkdr', 'bblr', 'shotAccuracy', 'winRate', 'goldRate', 'trophyRate'];

const RATIO_KEYS = [
  ['wins', 'losses'],
  ['kills', 'deaths'],
  ['finalKills', 'finalDeaths'],
  ['bedsBroken', 'bedsLost'],
  ['kills', 'shotFired', 100],
  ['wins', 'gamesPlayed', 100],
  ['gold', 'gamesPlayed', 100],
  ['total', 'gamesPlayed', 100],
] as const;

@Injectable()
export class HistoricalService {
  private readonly logger = new Logger('HistoricalService');

  public constructor(
    private readonly playerService: PlayerService,
    @InjectModel(Daily) private readonly dailyModel: ReturnModelType<typeof Player>,
    @InjectModel(Weekly) private readonly weeklyModel: ReturnModelType<typeof Player>,
    @InjectModel(Monthly) private readonly monthlyModel: ReturnModelType<typeof Player>,
    @InjectModel(LastDay) private readonly lastDayModel: ReturnModelType<typeof Player>,
    @InjectModel(LastWeek) private readonly lastWeekModel: ReturnModelType<typeof Player>,
    @InjectModel(LastMonth) private readonly lastMonthModel: ReturnModelType<typeof Player>
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  public async resetPlayers() {
    const date = new Date();
    const minute = this.getMinute(date);

    const players = await this.dailyModel
      .find({ resetMinute: minute })
      .select({ uuid: 1 })
      .lean()
      .exec();

    const type = this.getType(date);

    players.forEach(async ({ uuid }) => {
      const player = await this.playerService.findOne(uuid, HypixelCache.LIVE);

      if (player) this.resetPlayer(player, type);
      else this.logger.error(`Could not reset player with uuid ${uuid}`);
    });
  }

  public async findAndReset(tag: string, type: HistoricalType) {
    const player = await this.playerService.findOne(tag, HypixelCache.LIVE);

    if (!player) return null;

    player.resetMinute = this.getMinute(new Date());

    return this.resetPlayer(player, type);
  }

  public async resetPlayer(player: Player, resetType: HistoricalType) {
    const isMonthly =
      resetType === HistoricalType.MONTHLY || resetType === HistoricalType.LAST_MONTH;
    const isWeekly =
      resetType === HistoricalType.WEEKLY || resetType === HistoricalType.LAST_WEEK || isMonthly;

    const flatPlayer = flatten(player);

    const doc = serialize(Player, flatPlayer);

    const reset = async (
      model: ReturnModelType<typeof Player>,
      lastModel: ReturnModelType<typeof Player>,
      doc: Flatten<Player>
    ) => {
      const last = await model
        .findOneAndReplace({ uuid: doc.uuid }, doc, { upsert: true })
        .lean()
        .exec();

      await lastModel
        .replaceOne({ uuid: doc.uuid }, (last ?? doc) as Player, { upsert: true })
        .lean()
        .exec();
    };

    await reset(this.dailyModel, this.lastDayModel, doc);

    if (isWeekly) await reset(this.weeklyModel, this.lastWeekModel, doc);
    if (isMonthly) await reset(this.monthlyModel, this.lastMonthModel, doc);

    return deserialize(Player, flatPlayer);
  }

  public async findOneAndMerge(tag: string, type: HistoricalType): Promise<Player | null> {
    const [newPlayer, oldPlayer, isNew] = await this.findOne(tag, type);
    if (!newPlayer || !oldPlayer) return null;

    const merged = this.merge(oldPlayer, newPlayer);

    merged.isNew = isNew;

    return merged;
  }

  private async findOne(
    tag: string,
    type: HistoricalType
  ): Promise<[newPlayer: Player | null, oldPlayer: Player | null, isNew?: boolean]> {
    let newPlayer: Player;

    if (
      [HistoricalType.LAST_DAY, HistoricalType.LAST_WEEK, HistoricalType.LAST_MONTH].includes(type)
    ) {
      const lastMap = {
        [HistoricalType.LAST_DAY]: this.dailyModel,
        [HistoricalType.LAST_WEEK]: this.weeklyModel,
        [HistoricalType.LAST_MONTH]: this.monthlyModel,
      };

      const player = await lastMap[type as keyof typeof lastMap]
        .findOne({ uuid: tag })
        .lean()
        .exec();

      if (!player) return [null, null];

      newPlayer = deserialize(Player, flatten(player));
    } else {
      const player = await this.playerService.findOne(tag, HypixelCache.LIVE);
      if (!player) return [null, null];

      newPlayer = player;
    }

    const models = {
      [HistoricalType.DAILY]: this.dailyModel,
      [HistoricalType.WEEKLY]: this.weeklyModel,
      [HistoricalType.MONTHLY]: this.monthlyModel,
      [HistoricalType.LAST_DAY]: this.lastDayModel,
      [HistoricalType.LAST_WEEK]: this.lastWeekModel,
      [HistoricalType.LAST_MONTH]: this.lastMonthModel,
    };

    let oldPlayer = (await models[type].findOne({ uuid: newPlayer.uuid }).lean().exec()) as Player;
    let isNew = false;

    if (!oldPlayer) {
      const date = new Date();
      const minute = this.getMinute(date);

      newPlayer.resetMinute = minute;

      oldPlayer = await this.resetPlayer(newPlayer, HistoricalType.MONTHLY);
      isNew = true;
    }

    return [newPlayer, deserialize(Player, flatten(oldPlayer)), isNew];
  }

  private merge<T>(oldOne: T, newOne: T): T {
    const merged = {} as T;

    const keys = Object.keys({ ...oldOne, ...newOne });

    for (const _key of keys) {
      const key = _key as keyof T;
      const newOneType = typeof newOne[key];

      if (typeof oldOne[key] === 'number' || newOneType === 'number') {
        const ratioIndex = RATIOS.indexOf(_key as string);

        if (ratioIndex !== -1) {
          const numerator = sub(
            newOne[RATIO_KEYS[ratioIndex][0] as unknown as keyof T] as unknown as number,
            oldOne[RATIO_KEYS[ratioIndex][0] as unknown as keyof T] as unknown as number
          );

          const denominator = sub(
            newOne[RATIO_KEYS[ratioIndex][1] as unknown as keyof T] as unknown as number,
            oldOne[RATIO_KEYS[ratioIndex][1] as unknown as keyof T] as unknown as number
          );

          merged[key] = ratio(
            numerator,
            denominator,
            RATIO_KEYS[ratioIndex][2] ?? 1
          ) as unknown as T[keyof T];
        } else {
          merged[key] = sub(
            newOne[key] as unknown as number,
            oldOne[key] as unknown as number
          ) as unknown as T[keyof T];
        }
      } else if (newOneType === 'string') {
        merged[key] = newOne[key];
      } else if (isObject(newOne[key])) {
        if (key === 'progression') {
          merged[key] = newOne[key];
        } else {
          merged[key] = this.merge(oldOne[key] ?? {}, newOne[key] ?? {}) as unknown as T[keyof T];
        }
      }
    }

    return merged;
  }

  private getMinute(date: Date) {
    return date.getHours() * 60 + date.getMinutes();
  }

  private getType(date: Date) {
    return date.getDate() === 1
      ? HistoricalType.MONTHLY
      : date.getDay() === 1
      ? HistoricalType.WEEKLY
      : HistoricalType.DAILY;
  }
}
