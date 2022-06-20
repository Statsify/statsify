/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { add } from '@statsify/math';
import { APIData } from '@statsify/util';
import { Field } from '../../../metadata';
import { Deathmatch, Defusal, GunGame } from './mode';

export const COPS_AND_CRIMS_MODES = ['defusal', 'deathmatch', 'gunGame'] as const;
export type CopsAndCrimsModes = typeof COPS_AND_CRIMS_MODES;

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

export * from './mode';
