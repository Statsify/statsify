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
    const minute = date.getHours() * 60 + date.getMinutes();

    const players = await this.dailyModel
      .find({ resetMinute: minute })
      .select({ uuid: 1 })
      .lean()
      .exec();

    const type =
      date.getDate() === 1
        ? HistoricalType.MONTHLY
        : date.getDay() === 1
        ? HistoricalType.WEEKLY
        : HistoricalType.DAILY;

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
  }
}
