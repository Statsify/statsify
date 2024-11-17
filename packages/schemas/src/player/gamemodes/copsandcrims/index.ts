/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type APIData, findScoreIndex } from "@statsify/util";
import { CopsAndCrimsOverall, Deathmatch, Defusal, GunGame } from "./mode.js";
import { type ExtractGameModes, GameModes } from "#game";
import { Field } from "#metadata";
import { LEVEL_REQUIREMENTS, getFormattedLevel, getIntendedLevelFormatted } from "./util.js";
import { Progression } from "#progression";
import { add } from "@statsify/math";
import { createPrefixProgression } from "#prefixes";

export const COPS_AND_CRIMS_MODES = new GameModes([
  { api: "overall" },
  { api: "defusal", hypixel: "normal" },
  { api: "deathmatch", hypixel: "deathmatch" },
  { api: "gunGame", hypixel: "gungame" },
  { hypixel: "normal_party", formatted: "Challenge" },
] as const);

export type CopsAndCrimsModes = ExtractGameModes<typeof COPS_AND_CRIMS_MODES>;

export class CopsAndCrims {
  @Field({ historical: { enabled: false } })
  public coins: number;

  @Field()
  public score: number;

  @Field()
  public level: number;

  @Field({ store: { default: getIntendedLevelFormatted(0) } })
  public naturalLevelFormatted: string;

  @Field()
  public levelFormatted: string;

  @Field()
  public nextLevelFormatted: string;

  @Field()
  public progression: Progression;

  @Field()
  public overall: CopsAndCrimsOverall;

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
    this.overall = new CopsAndCrimsOverall(data, this.defusal, this.deathmatch, this.gunGame);

    if (data.score === undefined) {
      this.score = Math.floor(add(
        this.overall.kills / 2,
        add(this.defusal.bombsDefused, this.defusal.bombsPlanted) / 3,
        this.overall.wins
      ));

      this.level = findScoreIndex(LEVEL_REQUIREMENTS, this.score) + 1;
    } else {
      this.score = data.score;
      this.level = data.level ?? 0;
    }

    this.naturalLevelFormatted = getIntendedLevelFormatted(this.level);
    this.levelFormatted = getFormattedLevel(this.level, data.active_scheme, data.active_emblem);
    this.nextLevelFormatted = getIntendedLevelFormatted(this.level + 1);
    this.progression = createPrefixProgression(LEVEL_REQUIREMENTS, this.score);
  }
}

export * from "./mode.js";
