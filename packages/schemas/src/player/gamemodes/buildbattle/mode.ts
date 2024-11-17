/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Field } from "#metadata";
import type { APIData } from "@statsify/util";

export class BuildBattleGuessTheBuild {
  @Field()
  public wins: number;

  public constructor(data: APIData) {
    this.wins = data.wins_guess_the_build;
  }
}

export class BuildBattleMultiplayerMode {
  @Field()
  public wins: number;

  public constructor(data: APIData, mode: string) {
    this.wins = data[`wins_${mode}_normal`];
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

export class BuildBattleSpeedBuilders {
  @Field()
  public wins: number;

  @Field()
  public perfectBuilds: number;

  public constructor(data: APIData, achievements: APIData) {
    this.wins = data.wins_speed_builders;
    this.perfectBuilds = achievements.buildbattle_speed_builders_perfectionist;
  }
}
