/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type Constructor, type Flatten, flatten } from "@statsify/util";
import { InjectModel } from "@m8a/nestjs-typegoose";
import { InjectRedis } from "#redis";
import { Injectable } from "@nestjs/common";
import { LeaderboardAdditionalStats, LeaderboardService } from "#leaderboards";
import {
  Player,
  SkyBlockStats,
  type SkyBlockStatsRow,
  getLeaderboardField,
  getLeaderboardFields,
  serialize,
} from "@statsify/schemas";
import { type LeaderboardQuery, PlayerNotFoundException } from "@statsify/api-client";
import { PlayerService } from "#player";
import { Redis } from "ioredis";
import { formatProfileName } from "@statsify/skyblock/display";
import type { ReturnModelType } from "@typegoose/typegoose";

/** A row's name: "Name (Profile)", the profile in its colors and with its mode's badge. */
export const memberName = (displayName: string, row: Pick<SkyBlockStatsRow, "cuteName" | "gameMode">) =>
  `${displayName}§r §7(${formatProfileName(row)}§7)`;

@Injectable()
export class SkyBlockLeaderboardService extends LeaderboardService {
  // The first parameter needs its own injection decorator, or it inherits LeaderboardService's Redis
  public constructor(
    @InjectModel(SkyBlockStats) private readonly statsModel: ReturnModelType<typeof SkyBlockStats>,
    @InjectModel(Player) private readonly playerModel: ReturnModelType<typeof Player>,
    private readonly playerService: PlayerService,
    @InjectRedis() redis: Redis
  ) {
    super(redis);
  }

  /** The members a row can name, since a name only comes from a player record, with each one's rank. */
  public async knownPlayers(uuids: string[]): Promise<Map<string, string | undefined>> {
    const players = await this.playerModel.find({ uuid: { $in: uuids } }).select({ uuid: true, rank: true }).lean().exec();
    return new Map(players.map(({ uuid, rank }) => [uuid, rank]));
  }

  /**
   * Saves a stored copy's rows, and drops `removed` and the looked-up player's rows on profiles the copy no longer has.
   * A number a row leaves out, because its section's prices weren't ready, keeps the stored one.
   */
  public async addMembers(uuid: string, profileIds: string[], rows: SkyBlockStatsRow[], removed: string[]) {
    const [stored, gone] = await Promise.all([
      this.statsModel
        .find({ id: { $in: rows.map((row) => `${row.uuid}:${row.profileId}`) } })
        .select({ id: true, overall: true, networthAsOf: true })
        .lean()
        .exec(),
      this.statsModel
        .find({ uuid, profileId: { $nin: profileIds } })
        .select({ id: true })
        .lean()
        .exec(),
    ]);

    const storedById = new Map(stored.map((row) => [row.id, row]));

    const members = rows.map((row) => {
      const old = storedById.get(`${row.uuid}:${row.profileId}`);
      const boards = { ...old?.overall, ...row.boards };
      return flatten(new SkyBlockStats({ ...row, networthAsOf: row.networthAsOf ?? old?.networthAsOf, boards }));
    });

    const dropped = [...removed, ...gone.map(({ id }) => id)];

    await Promise.all([
      ...members.map((member) =>
        this.statsModel.replaceOne({ id: member.id }, serialize(SkyBlockStats, member), { upsert: true }).exec()
      ),
      ...(dropped.length > 0 ? [this.statsModel.deleteMany({ id: { $in: dropped } }).exec()] : []),
      ...members.map((member) => this.addLeaderboards(SkyBlockStats, member, "id")),
      ...dropped.map((id) => this.addLeaderboards(SkyBlockStats, { id } as Flatten<SkyBlockStats>, "id", true)),
    ]);
  }

  /** Tied rows share a rank, unlike on the player and guild boards. */
  public async getLeaderboard<T>(constructor: Constructor<T>, field: string, input: number | string, type: LeaderboardQuery) {
    const leaderboard = await super.getLeaderboard(constructor, field, input, type);
    const [first] = leaderboard.data;
    if (!first) return leaderboard;

    const scores = await this.redis.zmscore(`skyblockstats.${field}`, leaderboard.data.map(({ id }) => id));
    const ranks = await this.sharedRanks(field, scores.map(Number), first.position - 1);
    return { ...leaderboard, data: leaderboard.data.map((row, index) => ({ ...row, position: ranks[index] })) };
  }

  /** The ranks of a page of scores starting at `top`, where tied rows share one (1, 2, 2, 4) in the board's order. */
  public async sharedRanks(field: string, scores: number[], top: number): Promise<number[]> {
    if (scores.length === 0) return [];

    const key = `skyblockstats.${field}`;
    const ascending = getLeaderboardField(SkyBlockStats, field).sort === "ASC";
    const ahead = await (ascending ? this.redis.zcount(key, "-inf", `(${scores[0]}`) : this.redis.zcount(key, `(${scores[0]}`, "+inf"));

    const ranks = [ahead + 1];
    for (let index = 1; index < scores.length; index++) {
      ranks.push(scores[index] === scores[index - 1] ? ranks[index - 1] : top + index + 1);
    }

    return ranks;
  }

  /** The player's best rank on a board over their profiles, counted from 0, or undefined when none is on it. */
  public async bestRank(uuid: string, field: string): Promise<number | undefined> {
    const rows = await this.statsModel.find({ uuid }).select({ id: true }).lean().exec();
    const key = `skyblockstats.${field}`;
    const ascending = getLeaderboardField(SkyBlockStats, field).sort === "ASC";

    const ranks = await Promise.all(rows.map(({ id }) => (ascending ? this.redis.zrank(key, id) : this.redis.zrevrank(key, id))));
    const ranked = ranks.filter((rank) => rank !== null);
    return ranked.length > 0 ? Math.min(...ranked) : undefined;
  }

  /**
   * Where the player ranks on every board they're on within its depth, best rank first. Each board counts once, at the
   * player's best profile on it, and ties share a rank as on the boards.
   */
  public async getPlayerRankings(tag: string) {
    const player = await this.playerService.findMongoDocument(tag, { uuid: true });
    if (!player) throw new PlayerNotFoundException();

    const rows = await this.statsModel.find({ uuid: player.uuid }).select({ id: true }).lean().exec();
    const fields = getLeaderboardFields(SkyBlockStats).map(([field]) => ({ field, ...getLeaderboardField(SkyBlockStats, field) }));

    const scores = this.redis.pipeline();
    for (const { field } of fields) for (const { id } of rows) scores.zscore(`skyblockstats.${field}`, id);
    const scored = (await scores.exec()) ?? [];

    const best = fields.flatMap((board, index) => {
      const own = scored
        .slice(index * rows.length, (index + 1) * rows.length)
        .flatMap(([, score], row) => (score === null ? [] : [{ id: rows[row].id, score: Number(score) }]));
      if (own.length === 0) return [];

      const pick = own.reduce((a, b) => ((board.sort === "ASC" ? b.score < a.score : b.score > a.score) ? b : a));
      return [{ ...board, ...pick }];
    });

    const counts = this.redis.pipeline();
    for (const { field, sort, score } of best) {
      const key = `skyblockstats.${field}`;
      if (sort === "ASC") counts.zcount(key, "-inf", `(${score}`);
      else counts.zcount(key, `(${score}`, "+inf");
    }
    const ahead = (await counts.exec()) ?? [];

    return best
      .map((board, index) => ({ ...board, rank: Number(ahead[index][1]) + 1 }))
      .filter(({ rank, limit }) => rank <= limit)
      .toSorted((a, b) => a.rank - b.rank)
      .map(({ field, name, id, rank, formatter, score }) => ({ field, name, id, rank, value: formatter ? formatter(score) : score }));
  }

  protected async searchLeaderboardInput(input: string, field: string): Promise<number> {
    const player = await this.playerService.findMongoDocument(input, { uuid: true });
    if (!player) throw new PlayerNotFoundException();

    const rank = await this.bestRank(player.uuid, field);
    if (rank === undefined || rank >= getLeaderboardField(SkyBlockStats, field).limit) throw new PlayerNotFoundException();
    return rank + 1;
  }

  protected async getAdditionalStats(ids: string[], fields: string[]): Promise<LeaderboardAdditionalStats[]> {
    const selector: Record<string, boolean> = { id: true, uuid: true, cuteName: true, gameMode: true };
    for (const field of fields) selector[field] = true;

    const rows = await this.statsModel.find({ id: { $in: ids } }).select(selector).lean().exec();

    const players = await this.playerModel
      .find({ uuid: { $in: rows.map((row) => row.uuid) } })
      .select({ uuid: true, displayName: true })
      .lean()
      .exec();

    const rowsById = new Map(rows.map((row) => [row.id, row]));
    const namesByUuid = new Map(players.map((player) => [player.uuid, player.displayName]));

    return ids.map((id) => {
      const row = rowsById.get(id);
      const stats = flatten(row ?? null) as LeaderboardAdditionalStats;
      if (row) stats.name = memberName(namesByUuid.get(row.uuid) ?? row.uuid, row);
      return stats;
    });
  }
}
