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
import { GamePrefix, createPrefixProgression } from "../prefixes";
import { Progression } from "../../../progression";
import { UHCMode } from "./mode";
import { deepAdd } from "@statsify/math";
import { getLevelIndex, titleScores } from "./util";

const formatLevel = (level: number | string) => `§6[${level}✫]`;

export const UHC_MODES = new GameModes([
  { api: "overall" },
  { api: "solo", hypixel: "SOLO" },
  { api: "teams", hypixel: "TEAMS" },
]);

const prefixes: GamePrefix[] = titleScores.map((level) => ({
  fmt: formatLevel,
  req: level.req,
}));

export type UHCModes = IGameModes<typeof UHC_MODES>;

export class UHC {
  @Field()
  public overall: UHCMode;

  @Field()
  public solo: UHCMode;

  @Field()
  public teams: UHCMode;

  @Field({ leaderboard: { historical: false } })
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
      new UHCMode(data, "no diamonds"),
      new UHCMode(data, "vanilla doubles"),
      new UHCMode(data, "brawl"),
      new UHCMode(data, "solo brawl"),
      new UHCMode(data, "duo brawl")
    );

    UHCMode.applyRatios(this.overall);
  }
}

export * from "./mode";
