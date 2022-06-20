/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { APIData } from '@statsify/util';
import { Field } from '../../../metadata';

export class BuildBattleGuessTheBuild {
  @Field()
  public wins: number;

  @Field()
  public correctGuesses: number;

  public constructor(data: APIData) {
    this.wins = data.wins_guess_the_build;
    this.correctGuesses = data.correct_guesses;
  }
}

export class BuildBattleMultiplayerMode {
  @Field()
  public wins: number;

  @Field()
  public maxPoints: number;

  public constructor(data: APIData, mode: string) {
    this.wins = data[`wins_${mode}_normal`];
    this.maxPoints = data[`${mode}_most_points`];
  }
}

export class BuildBattleOverall {
  @Field()
  public wins: number;

  public constructor(data: APIData) {
    this.wins = data.wins;
  }
}

export class BuildBattlePro {
  @Field()
  public wins: number;

  public constructor(data: APIData) {
    this.wins = data.wins_solo_pro;
  }
}
