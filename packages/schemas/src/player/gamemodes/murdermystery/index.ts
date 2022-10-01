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
import { GameModes } from "../../../game";
import {
  GameType,
  GetMetadataModes,
  Mode,
  StatsifyApiModes,
} from "../../../metadata/GameType";
import { add } from "@statsify/math";

@GameType()
export class MurderMystery {
  @Field()
  public coins: number;

  @Field()
  public lootChests: number;

  @Mode()
  @Field()
  public overall: StandardMurderMysteryMode;

  @Mode("MURDER_CLASSIC", "Classic")
  @Field()
  public classic: ClassicMurderMysteryMode;

  @Mode("MURDER_ASSASSINS", "Assassins")
  @Field()
  public assassins: AssassinsMurderMysteryMode;

  @Mode("MURDER_DOUBLE_UP", "Double Up")
  @Field()
  public doubleUp: ClassicMurderMysteryMode;

  @Mode("MURDER_INFECTION", "Infection")
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
    this.infection = new InfectionMurderMysteryMode(data, "MURDER_INFECTION");

    this.overall.heroWins = ap.murdermystery_countermeasures;
  }
}

export type MurderMysteryModes = StatsifyApiModes<MurderMystery>;
export const MURDER_MYSTERY_MODES = new GameModes<MurderMysteryModes>(
  GetMetadataModes(MurderMystery)
);

export * from "./mode";
