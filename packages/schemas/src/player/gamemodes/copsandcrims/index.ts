/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { APIData } from "@statsify/util";
import { Deathmatch, Defusal, GunGame } from "./mode";
import { Field } from "../../../metadata";
import { GameModes, IGameModes } from "../../../game";
import { add } from "@statsify/math";

export const COPS_AND_CRIMS_MODES = new GameModes([
  { api: "defusal", hypixel: "normal" },
  { api: "deathmatch", hypixel: "deathmatch" },
  { api: "gunGame", hypixel: "gungame" },
  { hypixel: "normal_party", formatted: "Challenge" },
]);

export type CopsAndCrimsModes = IGameModes<typeof COPS_AND_CRIMS_MODES>;

export class CopsAndCrims {
  @Field()
  public coins: number;

  @Field()
  public wins: number;

  @Field()
  public defusal: Defusal;

  @Field()
  public deathmatch: Deathmatch;

  @Field()
  public gunGame: GunGame;

  public constructor(data: APIData) {
    this.coins = data.coins;

    this.defusal = new Defusal(data);
    this.deathmatch = new Deathmatch(data);
    this.gunGame = new GunGame(data);

    this.wins = add(this.defusal.wins, this.deathmatch.wins, this.gunGame.wins);
  }
}

export * from "./mode";
