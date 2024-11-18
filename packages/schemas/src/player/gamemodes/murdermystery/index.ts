/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  AssassinsMurderMysteryMode,
  ClassicMurderMysteryMode,
  InfectionMurderMysteryMode,
  MurderMysteryKnife,
  StandardMurderMysteryMode,
} from "./mode.js";
import { Color } from "#color";
import { type ExtractGameModes, GameModes } from "#game";
import { Field } from "#metadata";
import type { APIData } from "@statsify/util";

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
] as const);

export type MurderMysteryModes = ExtractGameModes<typeof MURDER_MYSTERY_MODES>;

export class MurderMystery {
  @Field({ historical: { enabled: false } })
  public tokens: number;

  @Field()
  public emblemFormatted: string;

  @Field()
  public knife: MurderMysteryKnife;

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
    this.tokens = data.coins;

    const emblemSelection = data.emblem?.selected_icon;
    const emblemColor = new Color(data.emblem?.selected_color ?? "GRAY");

    this.emblemFormatted = EMBLEM_MAP[emblemSelection] ? `${emblemColor.code}${EMBLEM_MAP[emblemSelection]}` : "";
    this.knife = new MurderMysteryKnife(data);

    this.overall = new StandardMurderMysteryMode(data, "");
    this.classic = new ClassicMurderMysteryMode(data, "MURDER_CLASSIC");
    this.doubleUp = new ClassicMurderMysteryMode(data, "MURDER_DOUBLE_UP");
    this.assassins = new AssassinsMurderMysteryMode(data, "MURDER_ASSASSINS");
    this.infection = new InfectionMurderMysteryMode(data, "MURDER_INFECTION");

    this.overall.heroWins = ap.murdermystery_countermeasures;
  }
}

const EMBLEM_MAP: Record<string, string> = {
  DIVINE: "Φ",
  ZERO: "∅",
  SIGMA: "Σ",
  OMEGA: "Ω",
  ALPHA: "α",
  EQUIVALENCE: "≡",
  RICH: "$",
  PODIUM: "π",
  FLORIN: "ƒ",
};

export * from "./mode.js";
