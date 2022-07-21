/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { APIData } from "@statsify/util";
import {
  AssassinsMurderMysteryMode,
  ClassicMurderMysteryMode,
  InfectionMurderMysteryMode,
  StandardMurderMysteryMode,
} from "./mode";
import { Field } from "../../../metadata";
import { GameModes, IGameModes } from "../../../game";
import { add } from "@statsify/math";

export const MURDER_MYSTERY_MODES = new GameModes([
  { api: "overall" },
  { api: "classic" },
  { api: "doubleUp" },
  { api: "assassins" },
  { api: "infection" },

  { hypixel: "MURDER_DOUBLE_UP", formatted: "Double Up" },
  { hypixel: "MURDER_INFECTION", formatted: "Infection" },
  { hypixel: "MURDER_ASSASSINS", formatted: "Assassins" },
  { hypixel: "MURDER_CLASSIC", formatted: "Classic" },
]);

export type MurderMysteryModes = IGameModes<typeof MURDER_MYSTERY_MODES>;

export class MurderMystery {
  @Field()
  public coins: number;

  @Field()
  public lootChests: number;

  @Field()
  public overall: StandardMurderMysteryMode;

  @Field()
  public classic: ClassicMurderMysteryMode;

  @Field()
  public assassins: AssassinsMurderMysteryMode;

  @Field()
  public doubleUp: ClassicMurderMysteryMode;

  @Field()
  public infection: InfectionMurderMysteryMode;

  public constructor(data: APIData, ap: APIData) {
    this.coins = data.coins;

    this.lootChests = add(
      data.mm_chests,
      data.mm_easter_chests,
      data.mm_christmas_chests,
      data.mm_halloween_chests,
      data.mm_lunar_chests,
      data.mm_golden_chests
    );

    this.overall = new StandardMurderMysteryMode(data, "");
    this.classic = new ClassicMurderMysteryMode(data, "MURDER_CLASSIC");
    this.doubleUp = new ClassicMurderMysteryMode(data, "MURDER_DOUBLE_UP");
    this.assassins = new AssassinsMurderMysteryMode(data, "MURDER_ASSASSINS");
    this.infection = new InfectionMurderMysteryMode(data, "MURDER_INFECTION", ap);

    this.overall.heroWins = ap.murdermystery_countermeasures;
  }
}

export * from "./mode";
