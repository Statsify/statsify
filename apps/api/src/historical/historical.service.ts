/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Cron, CronExpression } from "@nestjs/schedule";
import { Daily, LastDay, LastMonth, LastWeek, Monthly, Weekly } from "./models";
import { Flatten, flatten } from "@statsify/util";
import { HistoricalType, HypixelCache } from "@statsify/api-client";
import { InjectModel } from "@m8a/nestjs-typegoose";
import { Injectable, Logger } from "@nestjs/common";
import { Player, RATIOS, RATIO_STATS, deserialize, serialize } from "@statsify/schemas";
import { PlayerService } from "../player";
import { ReturnModelType } from "@typegoose/typegoose";
import { isObject } from "class-validator";
import { ratio, sub } from "@statsify/math";

@Injectable()
export class HistoricalService {
  private readonly logger = new Logger("HistoricalService");

  public constructor(
    private readonly playerService: PlayerService,
    @InjectModel(Daily) private readonly dailyModel: ReturnModelType<typeof Player>,
    @InjectModel(Weekly) private readonly weeklyModel: ReturnModelType<typeof Player>,
    @InjectModel(Monthly) private readonly monthlyModel: ReturnModelType<typeof Player>,
    @InjectModel(LastDay) private readonly lastDayModel: ReturnModelType<typeof Player>,
    @InjectModel(LastWeek) private readonly lastWeekModel: ReturnModelType<typeof Player>,
    @InjectModel(LastMonth)
    private readonly lastMonthModel: ReturnModelType<typeof Player>
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
      const player = await this.playerService.get(uuid, HypixelCache.LIVE);

      if (player) this.reset(player, type);
      else this.logger.error(`Could not reset player with uuid ${uuid}`);
    });
  }

  public async getAndReset(tag: string, type: HistoricalType, time?: number) {
    const player = await this.playerService.get(tag, HypixelCache.LIVE);

    if (!player) return null;

    player.resetMinute = time ?? this.getMinute(new Date());

    return this.reset(player, type);
  }

  public async reset(player: Player, resetType: HistoricalType) {
    const isMonthly =
      resetType === HistoricalType.MONTHLY || resetType === HistoricalType.LAST_MONTH;
    const isWeekly =
      resetType === HistoricalType.WEEKLY ||
      resetType === HistoricalType.LAST_WEEK ||
      isMonthly;

    const flatPlayer = flatten(player);

    const doc = serialize(Player, flatPlayer);

    const reset = async (
      model: ReturnModelType<typeof Player>,
      lastModel: ReturnModelType<typeof Player>,
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
    const [newPlayer, oldPlayer, isNew] = await this.getRaw(tag, type);
    if (!newPlayer || !oldPlayer) return null;

    const merged = this.merge(oldPlayer, newPlayer);

    merged.resetMinute = oldPlayer.resetMinute;
    merged.isNew = isNew;

    return merged;
  }

  private async getRaw(
    tag: string,
    type: HistoricalType
  ): Promise<[newPlayer: Player | null, oldPlayer: Player | null, isNew?: boolean]> {
    let newPlayer: Player;

    if (
      [
        HistoricalType.LAST_DAY,
        HistoricalType.LAST_WEEK,
        HistoricalType.LAST_MONTH,
      ].includes(type)
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
      const player = await this.playerService.get(tag, HypixelCache.LIVE);
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

    let oldPlayer = (await models[type]
      .findOne({ uuid: newPlayer.uuid })
      .lean()
      .exec()) as Player;

    let isNew = false;

    if (!oldPlayer) {
      const date = new Date();
      const minute = this.getMinute(date);

      newPlayer.resetMinute = minute;

      oldPlayer = await this.reset(newPlayer, HistoricalType.MONTHLY);
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

      if (typeof oldOne[key] === "number" || newOneType === "number") {
        const ratioIndex = RATIOS.indexOf(_key);

        if (ratioIndex !== -1) {
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
        } else {
          merged[key] = sub(
            newOne[key] as unknown as number,
            oldOne[key] as unknown as number
          ) as unknown as T[keyof T];
        }
      } else if (newOneType === "string") {
        merged[key] = newOne[key];
      } else if (isObject(newOne[key])) {
        if (key === "progression") {
          merged[key] = newOne[key];
        } else {
          merged[key] = this.merge(
            oldOne[key] ?? {},
            newOne[key] ?? {}
          ) as unknown as T[keyof T];
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
