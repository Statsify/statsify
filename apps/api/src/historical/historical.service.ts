import { InjectModel } from '@m8a/nestjs-typegoose';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { HypixelCache } from '@statsify/api-client';
import { deserialize, Player, serialize } from '@statsify/schemas';
import { Flatten, flatten } from '@statsify/util';
import { ReturnModelType } from '@typegoose/typegoose';
import { PlayerService } from '../player';
import { HistoricalType } from './historical-type.enum';
import { Daily, LastDay, LastMonth, LastWeek, Monthly, Weekly } from './models';

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

  public async findOne(
    tag: string,
    type: HistoricalType
  ): Promise<[newPlayer: Player | null, oldPlayer: Player | null, isNew?: boolean]> {
    const newPlayer = await this.playerService.findOne(tag, HypixelCache.LIVE);

    if (!newPlayer) return [null, null];

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
