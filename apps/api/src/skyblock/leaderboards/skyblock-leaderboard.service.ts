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
import {
  type LeaderboardAdditionalStats,
  LeaderboardService,
} from "#leaderboards";
import {
  Player,
  SkyBlockStats,
  type SkyBlockStatsRow,
  getLeaderboardField,
  serialize,
  skyblockStatsId,
  skyblockStatsUuid,
} from "@statsify/schemas";
import {
  type LeaderboardQuery,
  PlayerNotFoundException,
} from "@statsify/api-client";
import { PlayerService } from "#player";
import { Redis } from "ioredis";
import { formatProfileName } from "@statsify/skyblock/display";
import type { ReturnModelType } from "@typegoose/typegoose";

const formatMemberName = (
  displayName: string,
  row: Pick<SkyBlockStatsRow, "cuteName" | "gameMode">,
) => `${displayName}§r §7(${formatProfileName(row)}§7)`;

const getBoardKey = (field: string) => `skyblockstats.${field}`;

const toRemovedRow = (id: string) => ({ id }) as Flatten<SkyBlockStats>;

@Injectable()
export class SkyBlockLeaderboardService extends LeaderboardService {
  // Without its own decorator, the first parameter takes the base's Redis.
  public constructor(
    @InjectModel(SkyBlockStats) private readonly statsModel: ReturnModelType<
      typeof SkyBlockStats
    >,
    @InjectModel(Player) private readonly playerModel: ReturnModelType<
      typeof Player
    >,
    private readonly playerService: PlayerService,
    @InjectRedis() redis: Redis,
  ) {
    super(redis);
  }

  // Only a member with a player record has a name to show on a row.
  public async getKnownPlayers(uuids: string[]): Promise<Set<string>> {
    const players = await this.playerModel
      .find({ uuid: { $in: uuids } })
      .select({ uuid: true })
      .lean()
      .exec();
    return new Set(players.map(({ uuid }) => uuid));
  }

  // The player's rows on profiles missing from profileIds are dropped too.
  public async addMembers(
    uuid: string,
    profileIds: string[],
    rows: SkyBlockStatsRow[],
    removed: string[],
  ) {
    const [stored, gone] = await Promise.all([
      this.statsModel
        .find({
          id: {
            $in: rows.map((row) => skyblockStatsId(row.uuid, row.profileId)),
          },
        })
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
      const old = storedById.get(skyblockStatsId(row.uuid, row.profileId));
      // A stat a row leaves out while prices load keeps its stored value.
      const boards = { ...old?.overall, ...row.boards };
      return flatten(
        new SkyBlockStats({
          ...row,
          networthAsOf: row.networthAsOf ?? old?.networthAsOf,
          boards,
        }),
      );
    });

    const dropped = [...removed, ...gone.map(({ id }) => id)];

    const writes: Promise<unknown>[] = [
      ...members.map((member) =>
        this.statsModel
          .replaceOne({ id: member.id }, serialize(SkyBlockStats, member), {
            upsert: true,
          })
          .exec(),
      ),
      ...members.map((member) =>
        this.addLeaderboards(SkyBlockStats, member, "id"),
      ),
      ...dropped.map((id) =>
        this.addLeaderboards(SkyBlockStats, toRemovedRow(id), "id", true),
      ),
    ];

    if (dropped.length > 0) {
      writes.push(this.statsModel.deleteMany({ id: { $in: dropped } }).exec());
    }

    await Promise.all(writes);
  }

  public async removePlayer(uuid: string) {
    const rows = await this.statsModel
      .find({ uuid })
      .select({ id: true })
      .lean()
      .exec();

    await Promise.all([
      this.statsModel.deleteMany({ uuid }).exec(),
      ...rows.map(({ id }) =>
        this.addLeaderboards(SkyBlockStats, toRemovedRow(id), "id", true),
      ),
    ]);
  }

  // Tied rows share a rank here, unlike on the player and guild boards.
  public async getLeaderboard<T>(
    constructor: Constructor<T>,
    field: string,
    input: number | string,
    type: LeaderboardQuery,
  ) {
    const leaderboard = await super.getLeaderboard(
      constructor,
      field,
      input,
      type,
    );

    // A board can keep a member whose player record is gone, with no name.
    const data = leaderboard.data.filter((row) => row.name);
    if (data.length === 0) return { ...leaderboard, data };

    const scores = await this.redis.zmscore(
      getBoardKey(field),
      data.map(({ id }) => id),
    );
    const ranks = await this.getSharedRanks(field, scores.map(Number));
    return {
      ...leaderboard,
      data: data.map((row, index) => ({ ...row, position: ranks[index] })),
    };
  }

  protected async searchLeaderboardInput(
    input: string,
    field: string,
  ): Promise<number> {
    const player = await this.playerService.findMongoDocument(input, {
      uuid: true,
    });
    if (!player) throw new PlayerNotFoundException();

    const rank = await this.getBestRank(player.uuid, field);
    const { limit } = getLeaderboardField(SkyBlockStats, field);
    if (rank === undefined || rank >= limit) {
      throw new PlayerNotFoundException();
    }

    return rank + 1;
  }

  protected async getAdditionalStats(
    ids: string[],
    fields: string[],
  ): Promise<LeaderboardAdditionalStats[]> {
    const selector: Record<string, boolean> = {
      id: true,
      uuid: true,
      cuteName: true,
      gameMode: true,
    };
    for (const field of fields) selector[field] = true;

    const [rows, players] = await Promise.all([
      this.statsModel
        .find({ id: { $in: ids } })
        .select(selector)
        .lean()
        .exec(),
      this.playerModel
        .find({ uuid: { $in: ids.map(skyblockStatsUuid) } })
        .select({ uuid: true, displayName: true })
        .lean()
        .exec(),
    ]);

    const rowsById = new Map(rows.map((row) => [row.id, row]));
    const namesByUuid = new Map(
      players.map((player) => [player.uuid, player.displayName]),
    );

    return ids.map((id) => {
      const row = rowsById.get(id);
      const stats = flatten(row ?? null) as LeaderboardAdditionalStats;
      const displayName = row && namesByUuid.get(row.uuid);
      if (displayName) stats.name = formatMemberName(displayName, row);
      return stats;
    });
  }

  private async getSharedRanks(field: string, scores: number[]) {
    const key = getBoardKey(field);
    const ascending = getLeaderboardField(SkyBlockStats, field).sort === "ASC";
    const distinct = [...new Set(scores)];

    const ahead = await Promise.all(
      distinct.map((score) =>
        ascending
          ? this.redis.zcount(key, "-inf", `(${score}`)
          : this.redis.zcount(key, `(${score}`, "+inf"),
      ),
    );

    return scores.map((score) => ahead[distinct.indexOf(score)] + 1);
  }

  // Ranks count from 0, like Redis's, and undefined means no profile ranks.
  private async getBestRank(uuid: string, field: string) {
    const rows = await this.statsModel
      .find({ uuid })
      .select({ id: true })
      .lean()
      .exec();
    const key = getBoardKey(field);
    const ascending = getLeaderboardField(SkyBlockStats, field).sort === "ASC";

    const ranks = await Promise.all(
      rows.map(({ id }) =>
        ascending ? this.redis.zrank(key, id) : this.redis.zrevrank(key, id),
      ),
    );
    const ranked = ranks.filter((rank) => rank !== null);
    return ranked.length > 0 ? Math.min(...ranked) : undefined;
  }
}
