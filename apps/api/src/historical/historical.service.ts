/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { AsyncTask, SimpleIntervalJob } from "toad-scheduler";
import { Daily, LastDay, LastMonth, LastWeek, Monthly, Weekly } from "./models";
import { Flatten, flatten } from "@statsify/util";
import {
  HistoricalType,
  HypixelCache,
  PlayerNotFoundException,
} from "@statsify/api-client";
import { InjectModel } from "@m8a/nestjs-typegoose";
import { Injectable, Logger } from "@nestjs/common";
import { Player, RATIOS, RATIO_STATS, deserialize, serialize } from "@statsify/schemas";
import { PlayerService } from "../player";
import { ReturnModelType } from "@typegoose/typegoose";
import { isObject } from "class-validator";
import { ratio, sub } from "@statsify/math";

type PlayerModel = ReturnModelType<typeof Player>;

const LAST_HISTORICAL = [
  HistoricalType.LAST_DAY,
  HistoricalType.LAST_WEEK,
  HistoricalType.LAST_MONTH,
] as const;

type LastHistoricalType = typeof LAST_HISTORICAL[number];
type CurrentHistoricalType = Exclude<HistoricalType, LastHistoricalType>;

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
      resetType === HistoricalType.MONTHLY || resetType === HistoricalType.LAST_MONTH;

    const isWeekly =
      resetType === HistoricalType.WEEKLY ||
      resetType === HistoricalType.LAST_WEEK ||
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

    return deserialize(Player, flatPlayer);
  }

  public async get(tag: string, type: HistoricalType): Promise<Player | null> {
    const player = await this.playerService.get(tag, HypixelCache.CACHE_ONLY, {
      uuid: true,
    });

    if (!player) throw new PlayerNotFoundException();

    const [newPlayer, oldPlayer, isNew] = await this.getRaw(player.uuid, type);

    const merged = this.merge(oldPlayer, newPlayer);
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
    return LAST_HISTORICAL.includes(type as unknown as LastHistoricalType)
      ? this.getLastHistorical(uuid, type as unknown as LastHistoricalType)
      : this.getCurrentHistorical(uuid, type as unknown as CurrentHistoricalType);
  }

  private async getCurrentHistorical(
    uuid: string,
    type: CurrentHistoricalType
  ): Promise<RawHistoricalResponse> {
    const newPlayer = await this.playerService.get(uuid, HypixelCache.LIVE);
    if (!newPlayer) throw new PlayerNotFoundException();

    const CURRENT_MODELS = {
      [HistoricalType.DAILY]: this.dailyModel,
      [HistoricalType.WEEKLY]: this.weeklyModel,
      [HistoricalType.MONTHLY]: this.monthlyModel,
    };

    let oldPlayer = (await CURRENT_MODELS[type]
      .findOne({ uuid })
      .lean()
      .exec()) as Player;

    let isNew = false;

    if (oldPlayer) {
      oldPlayer = deserialize(Player, flatten(oldPlayer));
    } else {
      newPlayer.resetMinute = this.getMinute();
      oldPlayer = await this.reset(newPlayer, type);
      isNew = true;
    }

    return [newPlayer, oldPlayer, isNew];
  }

  private async getLastHistorical(
    uuid: string,
    type: LastHistoricalType
  ): Promise<RawHistoricalResponse> {
    const CURRENT_MODELS = {
      [HistoricalType.LAST_DAY]: this.dailyModel,
      [HistoricalType.LAST_WEEK]: this.weeklyModel,
      [HistoricalType.LAST_MONTH]: this.monthlyModel,
    };

    let newPlayer = (await CURRENT_MODELS[type]
      .findOne({ uuid })
      .lean()
      .exec()) as Player;

    let isNew = false;

    if (newPlayer) {
      newPlayer = deserialize(Player, flatten(newPlayer));
    } else {
      const livePlayer = await this.playerService.get(uuid, HypixelCache.LIVE);
      if (!livePlayer) throw new PlayerNotFoundException();

      livePlayer.resetMinute = this.getMinute();
      newPlayer = await this.reset(livePlayer, HistoricalType.MONTHLY);
      isNew = true;
    }

    const LAST_MODELS = {
      [HistoricalType.LAST_DAY]: this.lastDayModel,
      [HistoricalType.LAST_WEEK]: this.lastWeekModel,
      [HistoricalType.LAST_MONTH]: this.lastMonthModel,
    };

    const oldPlayer = (await LAST_MODELS[type].findOne({ uuid }).lean().exec()) as Player;
    if (!oldPlayer) throw new PlayerNotFoundException();

    return [newPlayer, deserialize(Player, flatten(oldPlayer)), isNew];
  }

  /**
   *
   * @param oldOne The old stats
   * @param newOne The new stats
   * @returns the new stats - the old stats
   */
  private merge<T extends {}>(oldOne: T, newOne: T): T {
    const merged = {} as T;

    const keys = Object.keys({ ...oldOne, ...newOne });

    for (const _key of keys) {
      const key = _key as keyof T;
      const newOneType = typeof newOne[key];

      if (typeof oldOne[key] === "number" || newOneType === "number") {
        const ratioIndex = RATIOS.indexOf(_key);

        if (ratioIndex === -1) {
          merged[key] = sub(
            newOne[key] as unknown as number,
            oldOne[key] as unknown as number
          ) as unknown as T[keyof T];
        } else {
          const numerator = sub(
            newOne[RATIO_STATS[ratioIndex][0] as unknown as keyof T] as unknown as number,
            oldOne[RATIO_STATS[ratioIndex][0] as unknown as keyof T] as unknown as number
          );

          const denominator = sub(
            newOne[RATIO_STATS[ratioIndex][1] as unknown as keyof T] as unknown as number,
            oldOne[RATIO_STATS[ratioIndex][1] as unknown as keyof T] as unknown as number
          );

          merged[key] = ratio(
            numerator,
            denominator,
            RATIO_STATS[ratioIndex][4] ?? 1
          ) as unknown as T[keyof T];
        }
      } else if (newOneType === "string") {
        merged[key] = newOne[key];
      } else if (isObject(newOne[key])) {
        merged[key] =
          key === "progression"
            ? newOne[key]
            : (this.merge(oldOne[key] ?? {}, newOne[key] ?? {}) as unknown as T[keyof T]);
      }
    }

    return merged;
  }

  /**
   *
   * @returns The current minute of the day
   */
  private getMinute() {
    const date = new Date();
    return date.getHours() * 60 + date.getMinutes();
  }

  /**
   *
   * @returns Whether the current time should daily, weekly, or monthly stats
   */
  private getType() {
    const date = new Date();

    return date.getDate() === 1
      ? HistoricalType.MONTHLY
      : date.getDay() === 1
      ? HistoricalType.WEEKLY
      : HistoricalType.DAILY;
  }
}
