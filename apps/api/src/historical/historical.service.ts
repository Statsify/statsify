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
import { Daily, LastDay, LastMonth, LastWeek, Monthly, Session, Weekly } from "./models";
import { DateTime } from "luxon";
import { Flatten, config, flatten } from "@statsify/util";
import { HistoricalLeaderboardService } from "./leaderboards/historical-leaderboard.service";
import { Inject, Injectable, Logger, forwardRef } from "@nestjs/common";
import { InjectModel } from "@m8a/nestjs-typegoose";
import {
  Player,
  createHistoricalPlayer,
  deserialize,
  serialize,
} from "@statsify/schemas";
import { PlayerService } from "../player/player.service";
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
  private readonly resetJob: SimpleIntervalJob;
  private readonly sweepJob: SimpleIntervalJob;
  public constructor(
    @Inject(forwardRef(() => PlayerService))
    private readonly playerService: PlayerService,
    @Inject(forwardRef(() => HistoricalLeaderboardService))
    private readonly historicalLeaderboardService: HistoricalLeaderboardService,
    @InjectModel(Daily) private readonly dailyModel: PlayerModel,
    @InjectModel(Weekly) private readonly weeklyModel: PlayerModel,
    @InjectModel(Monthly) private readonly monthlyModel: PlayerModel,
    @InjectModel(LastDay) private readonly lastDayModel: PlayerModel,
    @InjectModel(LastWeek) private readonly lastWeekModel: PlayerModel,
    @InjectModel(LastMonth) private readonly lastMonthModel: PlayerModel,
    @InjectModel(Session) private readonly sessionModel: PlayerModel
  ) {
    const resetTask = new AsyncTask("historicalReset", this.resetPlayers.bind(this));
    const sweepTask = new AsyncTask("historicalSweep", this.checkSweepPlayers.bind(this));

    this.resetJob = new SimpleIntervalJob({ minutes: 1 }, resetTask);
    this.resetJob.start();

    this.sweepJob = new SimpleIntervalJob({ minutes: 1 }, sweepTask, {
      preventOverrun: true,
    });
    this.sweepJob.start();
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
        await this.resetPlayer(player, type);
      } else {
        this.logger.error(`Could not reset player with uuid ${uuid}`);
      }
    });
  }

  public async checkSweepPlayers() {
    const dPlayers = await this.getAndSweep(
      this.dailyModel,
      this.lastDayModel,
      HistoricalTimes.DAILY
    );

    const wPlayers = await this.getAndSweep(
      this.weeklyModel,
      this.lastWeekModel,
      HistoricalTimes.WEEKLY,
      dPlayers
    );

    await this.getAndSweep(
      this.monthlyModel,
      this.lastMonthModel,
      HistoricalTimes.MONTHLY,
      wPlayers
    );
  }

  // Checks for players who were skipped in the reset process
  public async getAndSweep(
    model: PlayerModel,
    lastModel: PlayerModel,
    type: HistoricalType,
    playerMap?: Map<String, Player | null>
  ) {
    const sweepPlayers = await model
      .find({ nextReset: { $lte: Math.round(DateTime.now().toMillis() / 1000) } })
      .select({ uuid: true, resetMinute: true })
      .limit(config("environment") === "dev" ? 20 : 100)
      .lean()
      .exec();

    if (!playerMap) playerMap = new Map<String, Player>();
    sweepPlayers.forEach(async ({ uuid, resetMinute }) => {
      const player =
        playerMap?.get(uuid) ?? (await this.playerService.get(uuid, HypixelCache.LIVE));

      playerMap?.set(uuid, player);

      if (player) {
        const flatPlayer = flatten(player);

        const doc = serialize(Player, flatPlayer);

        doc.resetMinute = resetMinute ?? this.getMinute();

        await this.reset(model, lastModel, doc, type);
      } else {
        this.logger.error(`Could not sweep player with uuid ${uuid}`);
      }
    });

    return playerMap;
  }

  public async getAndReset(tag: string, type: HistoricalType, time?: number) {
    const player = await this.playerService.get(tag, HypixelCache.LIVE);
    if (!player) throw new PlayerNotFoundException();

    if (type !== HistoricalTimes.SESSION) {
      player.resetMinute = time ?? this.getMinute();
    }

    return this.resetPlayer(player, type);
  }

  /**
   *
   * @param player The player data to reset
   * @param resetType Whether to reset daily, weekly, or monthly
   * @returns The flattened player data
   */
  public async resetPlayer(player: Player, resetType: HistoricalType) {
    const isMonthly =
      resetType === HistoricalTimes.MONTHLY || resetType === HistoricalTimes.LAST_MONTH;

    const isWeekly =
      resetType === HistoricalTimes.WEEKLY ||
      resetType === HistoricalTimes.LAST_WEEK ||
      isMonthly;

    const isDaily = resetType !== HistoricalTimes.SESSION;

    const flatPlayer = flatten(player);

    const doc = serialize(Player, flatPlayer);

    doc.resetMinute = player.resetMinute ?? this.getMinute();
    flatPlayer.resetMinute = doc.resetMinute;

    const resets = [];

    if (isDaily) {
      this.reset(this.dailyModel, this.lastDayModel, doc, HistoricalTimes.DAILY);
    } else {
      this.reset(this.sessionModel, null, doc, HistoricalTimes.SESSION);
    }

    if (isWeekly)
      resets.push(
        this.reset(this.weeklyModel, this.lastWeekModel, doc, HistoricalTimes.WEEKLY)
      );

    if (isMonthly)
      resets.push(
        this.reset(this.monthlyModel, this.lastMonthModel, doc, HistoricalTimes.MONTHLY)
      );

    await Promise.all(resets);

    return deserialize(Player, flatPlayer);
  }

  public async reset(
    model: PlayerModel,
    lastModel: PlayerModel | null,
    doc: Flatten<Player>,
    time: HistoricalType
  ) {
    //findOneAndReplace doesn't unflatten the document so findOne and replaceOne need to be used separately
    const last = await model.findOne({ uuid: doc.uuid }).lean().exec();

    delete doc._id;
    doc.lastReset = Math.round(DateTime.now().toMillis() / 1000);
    doc.nextReset = this.getNextResetTime(doc.resetMinute, time);

    if (time === HistoricalTimes.SESSION)
      doc.sessionReset = Math.round(DateTime.now().toMillis() / 1000);

    if (last) delete last._id;

    const mongoChanges = [
      model.replaceOne({ uuid: doc.uuid }, doc, { upsert: true }).lean().exec(),
    ];

    if (lastModel) {
      mongoChanges.push(
        lastModel
          .replaceOne({ uuid: doc.uuid }, (last ?? doc) as Player, { upsert: true })
          .lean()
          .exec()
      );
    }

    await Promise.all([
      ...mongoChanges,
      this.historicalLeaderboardService.addHistoricalLeaderboards(
        time,
        Player,
        doc,
        "uuid",
        true
      ),
    ]);
  }

  public async get(tag: string, type: HistoricalType): Promise<Player | null> {
    const player = await this.playerService.get(tag, HypixelCache.CACHE_ONLY, {
      uuid: true,
    });

    if (!player) throw new PlayerNotFoundException();

    const [newPlayer, oldPlayer, isNew] = await this.getRaw(player.uuid, type);

    const merged = createHistoricalPlayer(oldPlayer, newPlayer);

    merged.resetMinute = oldPlayer.resetMinute;
    merged.lastReset = oldPlayer.lastReset;
    merged.nextReset = oldPlayer.nextReset;
    merged.sessionReset = oldPlayer.sessionReset;
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
      [HistoricalTimes.SESSION]: this.sessionModel,
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
      oldPlayer = await this.resetPlayer(newPlayer, type);
      isNew = true;
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

    if (newPlayer) {
      newPlayer = deserialize(Player, flatten(newPlayer));
    } else {
      const livePlayer = await this.playerService.get(uuid, HypixelCache.LIVE);
      if (!livePlayer) throw new PlayerNotFoundException();

      livePlayer.resetMinute = this.getMinute();
      newPlayer = await this.resetPlayer(livePlayer, HistoricalTimes.MONTHLY);
      isNew = true;
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

  private getNextResetTime(resetMinute: number, time: HistoricalType) {
    const now = DateTime.now();

    const hasResetToday = resetMinute! <= now.hour * 60 + now.minute;

    let resetTime = now
      .minus({ hours: now.hour, minutes: now.minute })
      .plus({ minutes: resetMinute! });

    const isSunday = now.weekday === 7;
    const isStartOfMonth = now.day === 1;

    if (time === HistoricalTimes.DAILY && hasResetToday) {
      resetTime = resetTime.plus({ days: 1 });
    } else if (
      time === HistoricalTimes.WEEKLY &&
      ((isSunday && hasResetToday) || !isSunday)
    ) {
      resetTime = resetTime.plus({ week: 1 }).minus({ days: isSunday ? 0 : now.weekday });
    } else if (
      time === HistoricalTimes.MONTHLY &&
      ((isStartOfMonth && hasResetToday) || !isStartOfMonth)
    ) {
      resetTime = resetTime.minus({ days: now.day - 1 }).plus({ months: 1 });
    }

    return Math.round(resetTime.toMillis() / 1000);
  }
}
