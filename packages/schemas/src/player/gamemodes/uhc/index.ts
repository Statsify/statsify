/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { APIData } from "@statsify/util";
import { Field } from "../../../metadata";
import { GameModes } from "../../../game";
import { GamePrefix, createPrefixProgression } from "../prefixes";
import {
  GameType,
  GetMetadataModes,
  Mode,
  StatsifyApiModes,
} from "../../../metadata/GameType";
import { Progression } from "../../../progression";
import { UHCMode } from "./mode";
import { deepAdd } from "@statsify/math";
import { getLevelIndex, titleScores } from "./util";

const formatLevel = (level: number | string) => `§6[${level}✫]`;

const prefixes: GamePrefix[] = titleScores.map((level) => ({
  fmt: formatLevel,
  req: level.req,
}));

@GameType()
export class UHC {
  @Mode()
  @Field()
  public overall: UHCMode;

  @Mode("SOLO")
  @Field()
  public solo: UHCMode;

  @Mode("TEAMS")
  @Field()
  public teams: UHCMode;

  @Field()
  public coins: number;

  @Field({ leaderboard: { enabled: false }, store: { default: 1 } })
  public level: number;

  @Field({ store: { default: formatLevel(1) } })
  public levelFormatted: string;

  @Field()
  public nextLevelFormatted: string;

  @Field()
  public progression: Progression;

  @Field()
  public score: number;

  @Field({ store: { default: "none" } })
  public kit: string;

  @Field({ store: { default: titleScores[0].title } })
  public title: string;

  public constructor(data: APIData) {
    this.coins = data.coins;
    this.score = data.score;

    this.kit = data.equippedKit ?? "none";

    const index = getLevelIndex(this.score);

    this.progression = createPrefixProgression(prefixes, this.score);

    this.level = index + 1;
    this.levelFormatted = formatLevel(this.level);
    this.nextLevelFormatted = formatLevel(Math.floor(this.level) + 1);
    this.title = titleScores[index].title;

    this.solo = new UHCMode(data, "solo");
    this.teams = new UHCMode(data, "");

    this.overall = deepAdd(
      this.solo,
      this.teams,
      new UHCMode(data, "no_diamonds"),
      new UHCMode(data, "vanilla_doubles"),
      new UHCMode(data, "brawl"),
      new UHCMode(data, "solo_brawl"),
      new UHCMode(data, "duo_brawl")
    );

    UHCMode.applyRatios(this.overall);
  }
}

export type UHCModes = StatsifyApiModes<UHC>;
export const UHC_MODES = new GameModes<UHCModes>(GetMetadataModes(UHC));

export * from "./mode";
