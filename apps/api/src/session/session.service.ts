/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { InjectModel, type MongoModel } from "#mongo";
import {
  CacheLevel,
  PlayerNotFoundException,
  SessionNotFoundException,
} from "@statsify/api-client";
import { type Circular, flatten } from "@statsify/util";
import { DateTime } from "luxon";
import {
  Inject,
  Injectable,
  UnauthorizedException,
  forwardRef,
} from "@nestjs/common";
import {
  type Player,
  PlayerSchema,
  UserSchema,
  deserialize,
  diff,
  serialize,
} from "@statsify/schemas";
import { PlayerService } from "#player";
import { Session } from "./session.model.js";

type PlayerModel = MongoModel<typeof PlayerSchema>;

@Injectable()
export class SessionService {
  public constructor(
    @Inject(forwardRef(() => PlayerService))
    private readonly playerService: Circular<PlayerService>,
    @InjectModel(Session.name) private readonly sessionModel: PlayerModel,
    @InjectModel(UserSchema) private readonly userModel: MongoModel<typeof UserSchema>
  ) {}

  public async getAndReset(tag: string) {
    const player = await this.playerService.get(tag, CacheLevel.LIVE);
    if (!player) throw new PlayerNotFoundException();
    return this.resetPlayer(player);
  }

  /**
   *
   * @param player The player data to reset
   * @returns The flattened player data
   */
  public async resetPlayer(player: Player) {
    const flatPlayer = flatten(player);
    flatPlayer.sessionReset = Math.round(DateTime.now().toMillis() / 1000);

    const doc = serialize(PlayerSchema, flatPlayer);

    await this.sessionModel.replaceOne({ uuid: doc.uuid }, doc, { upsert: true }).lean().exec();

    return deserialize(PlayerSchema, flatPlayer);
  }

  public async get(
    tag: string,
    userUuid?: string
  ): Promise<Player | null> {
    const player = await this.playerService.get(tag, CacheLevel.CACHE_ONLY, {
      uuid: true,
      displayName: true,
    });

    if (!player) throw new PlayerNotFoundException();

    let oldPlayer = await this.sessionModel
      .findOne({ uuid: player.uuid })
      .lean()
      .exec() as Player;

    let isNew = false;

    if (!oldPlayer && userUuid !== player.uuid) throw new SessionNotFoundException(player.uuid, player.displayName);

    const newPlayer = await this.playerService.get(player.uuid, CacheLevel.LIVE);

    if (!newPlayer) throw new PlayerNotFoundException();

    if (oldPlayer) {
      oldPlayer = deserialize(PlayerSchema, flatten(oldPlayer));
    } else {
      oldPlayer = await this.resetPlayer(newPlayer);
      isNew = true;
    }

    const merged = diff(PlayerSchema, oldPlayer, newPlayer);

    merged.sessionReset = oldPlayer.sessionReset;
    merged.isNew = isNew;

    return merged;
  }

  public async delete(discordId: string) {
    const user = await this.userModel
      .findOne()
      .where("id")
      .equals(discordId)
      .lean()
      .exec();

    if (!user || !user.uuid) throw new UnauthorizedException();

    await this.sessionModel
      .deleteOne()
      .where("uuid")
      .equals(user.uuid)
      .lean()
      .exec();
  }
}
