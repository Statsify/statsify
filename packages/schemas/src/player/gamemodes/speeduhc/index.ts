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
import { GameType, Mode, StatsifyApiModes } from "../../../metadata/GameType";
import { Progression } from "../../../progression";
import { SpeedUHCMastery } from "./mastery";
import { SpeedUHCMode } from "./mode";
import { getLevelIndex, titleScores } from "./util";

const formatLevel = (level: number | string) => `§d[${level}❋]`;

const prefixes: GamePrefix[] = titleScores.map((level) => ({
  fmt: formatLevel,
  req: level.req,
}));

@GameType()
export class SpeedUHC {
  @Mode()
  @Field()
  public overall: SpeedUHCMode;

  @Mode("solo_normal")
  @Field()
  public solo: SpeedUHCMode;

  @Mode("team_normal")
  @Field()
  public teams: SpeedUHCMode;

  @Field()
  public coins: number;

  @Field()
  public score: number;

  @Field({ store: { default: "none" } })
  public activeMastery: string;

  @Field({ store: { default: 1 }, leaderboard: { enabled: false } })
  public level: number;

  @Field({ store: { default: formatLevel(1) } })
  public levelFormatted: string;

  @Field()
  public nextLevelFormatted: string;

  @Field()
  public progression: Progression;

  @Field({ store: { default: titleScores[0].title } })
  public title: string;

  @Mode()
  @Field()
  public wildSpecialist: SpeedUHCMastery;

  @Mode()
  @Field()
  public guardian: SpeedUHCMastery;

  @Mode()
  @Field()
  public sniper: SpeedUHCMastery;

  @Mode()
  @Field()
  public berserk: SpeedUHCMastery;

  @Mode()
  @Field()
  public masterBaker: SpeedUHCMastery;

  @Mode()
  @Field()
  public invigorate: SpeedUHCMastery;

  @Mode()
  @Field()
  public huntsman: SpeedUHCMastery;

  @Mode()
  @Field()
  public fortune: SpeedUHCMastery;

  @Mode()
  @Field()
  public vampirism: SpeedUHCMastery;

  public constructor(data: APIData) {
    this.coins = data.coins;
    this.score = data.score;
    this.activeMastery = (data.activeMasterPerk ?? "none").replace("mastery_", "");

    this.overall = new SpeedUHCMode(data, "");
    this.solo = new SpeedUHCMode(data, "solo");
    this.teams = new SpeedUHCMode(data, "team");

    this.wildSpecialist = new SpeedUHCMastery(data, "wild_specialist");
    this.guardian = new SpeedUHCMastery(data, "guardian");
    this.sniper = new SpeedUHCMastery(data, "sniper");
    this.berserk = new SpeedUHCMastery(data, "berserk");
    this.masterBaker = new SpeedUHCMastery(data, "master_baker");
    this.invigorate = new SpeedUHCMastery(data, "invigorate");
    this.huntsman = new SpeedUHCMastery(data, "huntsman");
    this.fortune = new SpeedUHCMastery(data, "fortune");
    this.vampirism = new SpeedUHCMastery(data, "vampirism");

    const index = getLevelIndex(this.score);

    this.level = index + 1;
    this.levelFormatted = formatLevel(this.level);
    this.nextLevelFormatted = formatLevel(Math.floor(this.level) + 1);

    this.progression = createPrefixProgression(prefixes, this.score);

    this.title = titleScores[index].title;
  }
}

export type SpeedUHCModes = StatsifyApiModes<SpeedUHC>;
export const SPEED_UHC_MODES = new GameModes<SpeedUHCModes>([
  { api: "overall" },
  { api: "solo", hypixel: "solo_normal" },
  { api: "teams", hypixel: "team_normal" },
  { api: "wildSpecialist" },
  { api: "guardian" },
  { api: "sniper" },
  { api: "berserk" },
  { api: "masterBaker" },
  { api: "invigorate" },
  { api: "huntsman" },
  { api: "fortune" },
  { api: "vampirism" },
]);

export * from "./mastery";
export * from "./mode";
