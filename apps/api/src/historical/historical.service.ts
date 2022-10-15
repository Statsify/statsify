/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { AsyncTask, SimpleIntervalJob } from "toad-scheduler";
import {
  CurrentHistoricalType,
  HistoricalTimes,
  HistoricalType,
  HypixelCache,
  LastHistoricalType,
  PlayerNotFoundException,
} from "@statsify/api-client";
import { Daily, LastDay, LastMonth, LastWeek, Monthly, Weekly } from "./models";
import { Flatten, flatten } from "@statsify/util";
import { InjectModel } from "@m8a/nestjs-typegoose";
import { Injectable, Logger } from "@nestjs/common";
import {
  Player,
  createHistoricalPlayer,
  deserialize,
  serialize,
} from "@statsify/schemas";
import { PlayerService } from "../player";
import { ReturnModelType } from "@typegoose/typegoose";

type PlayerModel = ReturnModelType<typeof Player>;

const LAST_HISTORICAL = [
  LastHistoricalType.LAST_DAY,
  LastHistoricalType.LAST_WEEK,
  LastHistoricalType.LAST_MONTH,
] as const;

type RawHistoricalResponse = [newPlayer: Player, oldPlayer: Player, isNew?: boolean];

@Injectable()
export class HistoricalService {
  private readonly logger = new Logger("HistoricalService");
  private readonly job: SimpleIntervalJob;

  public constructor(
    private readonly playerService: PlayerService,
    @InjectModel(Daily) private readonly dailyModel: PlayerModel,
    @InjectModel(Weekly) private readonly weeklyModel: PlayerModel,
    @InjectModel(Monthly) private readonly monthlyModel: PlayerModel,
    @InjectModel(LastDay) private readonly lastDayModel: PlayerModel,
    @InjectModel(LastWeek) private readonly lastWeekModel: PlayerModel,
    @InjectModel(LastMonth) private readonly lastMonthModel: PlayerModel
  ) {
    const task = new AsyncTask("historicalReset", this.resetPlayers.bind(this));
    this.job = new SimpleIntervalJob({ minutes: 1 }, task);
    this.job.start();
  }

  public async resetPlayers() {
    const minute = this.getMinute();

    const players = await this.dailyModel
      .find({ resetMinute: minute })
      .select({ uuid: true })
      .lean()
      .exec();

    const type = this.getType();

    players.forEach(async ({ uuid }) => {
      const player = await this.playerService.get(uuid, HypixelCache.LIVE);

      if (player) {
        player.resetMinute = minute;
        await this.reset(player, type);
      } else {
        this.logger.error(`Could not reset player with uuid ${uuid}`);
      }
    });
  }

  public async getAndReset(tag: string, type: HistoricalType, time?: number) {
    const player = await this.playerService.get(tag, HypixelCache.LIVE);
    if (!player) throw new PlayerNotFoundException();

    player.resetMinute = time ?? this.getMinute();

    return this.reset(player, type);
  }

  /**
   *
   * @param player The player data to reset
   * @param resetType Whether to reset daily, weekly, or monthly
   * @returns The flattened player data
   */
  public async reset(player: Player, resetType: HistoricalType) {
    const isMonthly =
      resetType === HistoricalTimes.MONTHLY || resetType === HistoricalTimes.LAST_MONTH;

    const isWeekly =
      resetType === HistoricalTimes.WEEKLY ||
      resetType === HistoricalTimes.LAST_WEEK ||
      isMonthly;

    const flatPlayer = flatten(player);

    const doc = serialize(Player, flatPlayer);

    doc.resetMinute = player.resetMinute ?? this.getMinute();
    flatPlayer.resetMinute = doc.resetMinute;

    const reset = async (
      model: PlayerModel,
      lastModel: PlayerModel,
      doc: Flatten<Player>
    ) => {
      //findOneAndReplace doesn't unflatten the document so findOne and replaceOne need to be used separately
      const last = await model.findOne({ uuid: doc.uuid }).lean().exec();

      delete doc._id;
      if (last) delete last._id;

      await Promise.all([
        model.replaceOne({ uuid: doc.uuid }, doc, { upsert: true }).lean().exec(),
        lastModel
          .replaceOne({ uuid: doc.uuid }, (last ?? doc) as Player, { upsert: true })
          .lean()
          .exec(),
      ]);
    };

    await reset(this.dailyModel, this.lastDayModel, doc);
    if (isWeekly) await reset(this.weeklyModel, this.lastWeekModel, doc);
    if (isMonthly) await reset(this.monthlyModel, this.lastMonthModel, doc);

    this.playerService.saveOne(player, false);

    return deserialize(Player, flatPlayer);
  }

  public async get(tag: string, type: HistoricalType): Promise<Player | null> {
    const player = await this.playerService.get(tag, HypixelCache.CACHE_ONLY, {
      uuid: true,
    });

    if (!player) throw new PlayerNotFoundException();

    const [newPlayer, oldPlayer, isNew] = await this.getRaw(player.uuid, type);

    const merged = createHistoricalPlayer(oldPlayer, newPlayer);

    merged.resetMinute = oldPlayer.resetMinute;
    merged.isNew = isNew;

    return merged;
  }

  public async getResetTimes() {
    const minutes = (await this.dailyModel
      .find()
      .select({ resetMinute: 1 })
      .lean()
      .exec()) as { resetMinute: number }[];

    if (!minutes) return {};
    const resetMinutes = minutes.filter((metadata) => !!metadata.resetMinute);

    const arrayOfTimes = resetMinutes.map((metadata) => metadata.resetMinute);

    return arrayOfTimes.reduce(
      (acc, current) => (acc[current] ? ++acc[current] : (acc[current] = 1), acc),
      {} as Record<string, number>
    );
  }

  private getRaw(uuid: string, type: HistoricalType): Promise<RawHistoricalResponse> {
    return LAST_HISTORICAL.includes(type as LastHistoricalType)
      ? this.getLastHistorical(uuid, type as LastHistoricalType)
      : this.getCurrentHistorical(uuid, type as CurrentHistoricalType);
  }

  private async getCurrentHistorical(
    uuid: string,
    type: CurrentHistoricalType
  ): Promise<RawHistoricalResponse> {
    const newPlayer = await this.playerService.get(uuid, HypixelCache.LIVE);
    if (!newPlayer) throw new PlayerNotFoundException();

    const CURRENT_MODELS = {
      [HistoricalTimes.DAILY]: this.dailyModel,
      [HistoricalTimes.WEEKLY]: this.weeklyModel,
      [HistoricalTimes.MONTHLY]: this.monthlyModel,
    };

    let oldPlayer = (await CURRENT_MODELS[type]
      .findOne({ uuid })
      .lean()
      .exec()) as Player;

    let isNew = false;

    if (!oldPlayer) {
      newPlayer.resetMinute = this.getMinute();
      oldPlayer = await this.reset(newPlayer, type);
      isNew = true;
    } else {
      oldPlayer = deserialize(Player, flatten(oldPlayer));
    }

    return [newPlayer, oldPlayer, isNew];
  }

  private async getLastHistorical(
    uuid: string,
    type: LastHistoricalType
  ): Promise<RawHistoricalResponse> {
    const CURRENT_MODELS = {
      [HistoricalTimes.LAST_DAY]: this.dailyModel,
      [HistoricalTimes.LAST_WEEK]: this.weeklyModel,
      [HistoricalTimes.LAST_MONTH]: this.monthlyModel,
    };

    let newPlayer = (await CURRENT_MODELS[type]
      .findOne({ uuid })
      .lean()
      .exec()) as Player;

    let isNew = false;

    if (!newPlayer) {
      const livePlayer = await this.playerService.get(uuid, HypixelCache.LIVE);
      if (!livePlayer) throw new PlayerNotFoundException();

      livePlayer.resetMinute = this.getMinute();
      newPlayer = await this.reset(livePlayer, HistoricalTimes.MONTHLY);
      isNew = true;
    } else {
      newPlayer = deserialize(Player, flatten(newPlayer));
    }

    const LAST_MODELS = {
      [HistoricalTimes.LAST_DAY]: this.lastDayModel,
      [HistoricalTimes.LAST_WEEK]: this.lastWeekModel,
      [HistoricalTimes.LAST_MONTH]: this.lastMonthModel,
    };

    const oldPlayer = (await LAST_MODELS[type].findOne({ uuid }).lean().exec()) as Player;
    if (!oldPlayer) throw new PlayerNotFoundException();

    return [newPlayer, deserialize(Player, flatten(oldPlayer)), isNew];
  }

  /**
   *
   * @returns The current minute of the day
   */
  private getMinute() {
    const date = new Date();
    return date.getHours() * 60 + date.getMinutes();
  }
  private getType() {
    const date = new Date();

    return date.getDate() === 1
      ? HistoricalTimes.MONTHLY
      : date.getDay() === 1
      ? HistoricalTimes.WEEKLY
      : HistoricalTimes.DAILY;
  }
}
