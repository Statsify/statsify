/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Color } from "#color";
import { Field } from "#metadata";
import { modelOptions as ModelOptions, Severity } from "@typegoose/typegoose";
import { PlayerSocials } from "./socials.js";
import { PlayerStats } from "./stats.js";
import { PlayerStatus } from "./status.js";
import { PlayerUtil } from "./util.js";
import type { APIData } from "@statsify/util";

@ModelOptions({ options: { allowMixed: Severity.ALLOW } })
export class Player {
  @Field({ mongo: { unique: true, index: true }, store: { required: true } })
  public uuid: string;

  @Field()
  public username: string;

  @Field({ mongo: { index: true, lowercase: true }, store: { required: true } })
  public usernameToLower: string;

  @Field({ store: { default: "DEFAULT" } })
  public rank: string;

  @Field()
  public plusColor: Color;

  @Field({
    docs: {
      description: "The player's name with their rank color as seen in game lobbies",
      examples: ["§bj4cobi"],
    },
  })
  public prefixName: string;

  @Field({
    docs: {
      description: "The player's name with their formatted rank",
      examples: ["§b[MVP§c+] j4cobi"],
    },
  })
  public displayName: string;

  @Field()
  public socials: PlayerSocials;

  @Field({ leaderboard: { fieldName: "" } })
  public stats: PlayerStats;

  @Field()
  public status: PlayerStatus;

  @Field({
    leaderboard: { enabled: false },
    docs: { description: "The time the player's cache expires" },
  })
  public expiresAt: number;

  @Field({
    leaderboard: { enabled: false },
    store: { required: false, serialize: false, deserialize: false },
    docs: { description: "The minute the player's historical stats reset" },
  })
  public resetMinute?: number;

  @Field({
    leaderboard: { enabled: false },
    store: { required: false, serialize: false, deserialize: false },
    docs: { description: "The time the player's historical stats reset" },
  })
  public nextReset?: number;

  @Field({
    leaderboard: { enabled: false },
    store: { required: false, serialize: false, deserialize: false },
    docs: { description: "The time the player's historical stats last reset" },
  })
  public lastReset?: number;

  @Field({
    leaderboard: { enabled: false },
    store: { required: false, serialize: false, deserialize: false },
    docs: { description: "The time the player's session stats last reset" },
  })
  public sessionReset?: number;

  @Field({ store: { required: false, store: false } })
  public cached?: boolean;

  @Field({ store: { required: false, store: false } })
  public isNew?: boolean;

  @Field({ store: { required: false } })
  public guildId?: string;

  public constructor(data: APIData = {}) {
    this.uuid = data.uuid;
    this.username = data.displayname;
    this.usernameToLower = this.username?.toLowerCase();

    this.rank = PlayerUtil.getRank(data);
    this.plusColor = PlayerUtil.getPlusColor(this.rank, data?.rankPlusColor);
    this.prefixName = `${PlayerUtil.getRankColor(this.rank).toString()}${this.username}`;
    this.displayName = PlayerUtil.getDisplayName(
      this.username,
      this.rank,
      this.plusColor.code
    );

    this.socials = new PlayerSocials(data?.socialMedia?.links ?? {});
    this.stats = new PlayerStats(data);
    this.status = new PlayerStatus(data);

    //These will all be filled in by a service
    this.expiresAt = 0;
    this.resetMinute = 0;
    this.nextReset = 0;
    this.lastReset = 0;
  }
}

export * from "./gamemodes/index.js";
export * from "./socials.js";
export * from "./stats.js";
export * from "./status.js";
export { rankMap } from "./util.js";