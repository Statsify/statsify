import { HypixelCache } from '#hypixel/cache.enum';
import { PlayerService } from '#player/player.service';
import { InjectModel } from '@m8a/nestjs-typegoose';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Player } from '@statsify/schemas';
import { ReturnModelType } from '@typegoose/typegoose';
import { HistoricalType } from './historical-type.enum';

@Injectable()
export class HistoricalService {
  private readonly logger = new Logger('HistoricalService');

  public constructor(
    private readonly playerService: PlayerService,
    @InjectModel(Player) private readonly dailyModel: ReturnModelType<typeof Player>,
    @InjectModel(Player) private readonly weeklyModel: ReturnModelType<typeof Player>,
    @InjectModel(Player) private readonly monthlyModel: ReturnModelType<typeof Player>
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

  public async resetPlayer(player: Player, resetType: HistoricalType) {
    const isMonthly = resetType === HistoricalType.MONTHLY;
    const isWeekly = resetType === HistoricalType.WEEKLY || isMonthly;

    const doc = this.playerService.serialize(player);

    await this.dailyModel.replaceOne({ uuid: doc.uuid }, doc, { upsert: true });

    if (isWeekly) await this.weeklyModel.replaceOne({ uuid: doc.uuid }, doc, { upsert: true });
    if (isMonthly) await this.monthlyModel.replaceOne({ uuid: doc.uuid }, doc, { upsert: true });

    return this.playerService.deserialize(player);
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
    };

    let oldPlayer = (await models[type].findOne({ uuid: newPlayer.uuid }).lean().exec()) as Player;
    let isNew = false;

    if (!oldPlayer) {
      const date = new Date();
      const minute = this.getMinute(date);
      const type = this.getType(date);

      newPlayer.resetMinute = minute;

      oldPlayer = await this.resetPlayer(newPlayer, type);
      isNew = true;
    }

    return [newPlayer, this.playerService.deserialize(oldPlayer), isNew];
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
