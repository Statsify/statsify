/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { APIData } from "@statsify/util";
import { Field } from "../../../metadata";
import { GameModes, IGameModes } from "../../../game";
import { PaintballPerks } from "./perks";
import { ratio } from "@statsify/math";

export const PAINTBALL_MODES = new GameModes([{ api: "overall" }]);

export type PaintballModes = IGameModes<typeof PAINTBALL_MODES>;

export class Paintball {
  @Field()
  public coins: number;

  @Field({ leaderboard: { enabled: false } })
  public forcefieldTime: number;

  @Field()
  public kills: number;

  @Field()
  public deaths: number;

  @Field()
  public killstreaks: number;

  @Field({ leaderboard: { enabled: false } })
  public shotsFired: number;

  @Field({ store: { default: "none" } })
  public hat: string;

  @Field()
  public wins: number;

  @Field()
  public kdr: number;

  @Field({ leaderboard: { enabled: false } })
  public shotAccuracy: number;

  @Field()
  public perks: PaintballPerks;

  @Field()
  public tokens: number;

  public constructor(data: APIData, legacy: APIData) {
    this.coins = data.coins;
    this.forcefieldTime = (data.forcefieldTime ?? 0) * 1000;
    this.kills = data.kills;
    this.deaths = data.deaths;
    this.killstreaks = data.killstreaks;
    this.shotsFired = data.shots_fired;
    this.wins = data.wins;
    this.hat = data.hat;
    this.kdr = ratio(this.kills, this.deaths);
    this.shotAccuracy = ratio(this.kills, this.shotsFired, 100);
    this.perks = new PaintballPerks(data);
    this.tokens = legacy.paintball_tokens;
  }
}

export * from "./perks";
