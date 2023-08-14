/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type Circular, flatten } from "@statsify/util";
import { DateTime } from "luxon";
import {
  HypixelCache,
  PlayerNotFoundException,
  SessionNotFoundException,
} from "@statsify/api-client";
import {
  Inject,
  Injectable,
  forwardRef,
} from "@nestjs/common";
import { InjectModel } from "@m8a/nestjs-typegoose";
import {
  Player,
  createHistoricalPlayer,
  deserialize,
  serialize,
} from "@statsify/schemas";
import { PlayerService } from "#player";
import { Session } from "./session.model.js";
import type { ReturnModelType } from "@typegoose/typegoose";

type PlayerModel = ReturnModelType<typeof Player>;


@Injectable()
export class SessionService {

  public constructor(
    @Inject(forwardRef(() => PlayerService))
    private readonly playerService: Circular<PlayerService>,
    @InjectModel(Session) private readonly sessionModel: PlayerModel
  ) {}

  public async getAndReset(tag: string) {
    const player = await this.playerService.get(tag, HypixelCache.LIVE);
    if (!player) throw new PlayerNotFoundException();
    return this.resetPlayer(player);
  }

  /**
   *
   * @param player The player data to reset
   * @returns The flattened player data
   */
  public async resetPlayer(player: Player ) {
    const flatPlayer = flatten(player);
    const doc = serialize(Player, flatPlayer);

    doc.sessionReset = Math.round(DateTime.now().toMillis() / 1000);

    await this.sessionModel.replaceOne({ uuid: doc.uuid }, doc, { upsert: true }).lean().exec();

    return deserialize(Player, flatPlayer);
  }

  public async get(
    tag: string,
    upsert: boolean
  ): Promise<Player | null> {
    const player = await this.playerService.get(tag, HypixelCache.CACHE_ONLY, {
      uuid: true,
      displayName: true,
    });

    if (!player) throw new PlayerNotFoundException();


    let oldPlayer = await this.sessionModel
      .findOne({ uuid: player.uuid })
      .lean()
      .exec() as Player;

    let isNew = false;

    if (!oldPlayer && !upsert) throw new SessionNotFoundException(player.uuid, player.displayName);

    const newPlayer = await this.playerService.get(player.uuid, HypixelCache.LIVE);

    if (!newPlayer) throw new PlayerNotFoundException();

    if (oldPlayer) {
      oldPlayer = deserialize(Player, flatten(oldPlayer));
    } else {
      oldPlayer = await this.resetPlayer(newPlayer);
      isNew = true;
    }

    const merged = createHistoricalPlayer(oldPlayer, newPlayer);

    merged.sessionReset = oldPlayer.sessionReset;
    merged.isNew = isNew;

    return merged;
  }
}
