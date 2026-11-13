/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  BuildBattleGuessTheBuild,
  BuildBattleMultiplayerMode,
  BuildBattleOverall,
  BuildBattlePro,
  BuildBattleSpeedBuilders,
} from "./mode.js";
import { Color } from "#color";
import { type ExtractGameModes, GameModes } from "#game";
import { Field } from "#metadata";
import {
  GameTitle,
  createPrefixProgression,
  defaultPrefix,
  getFormattedPrefix,
} from "#prefixes";
import { Progression } from "#progression";
import type { APIData } from "@statsify/util";


export class BuildBattle {
  @Field()
  public overall: BuildBattleOverall;

  @Field()
  public solo: BuildBattleMultiplayerMode;

  @Field()
  public teams: BuildBattleMultiplayerMode;

  @Field()
  public pro: BuildBattlePro;

  @Field()
  public guessTheBuild: BuildBattleGuessTheBuild;

  @Field()
  public speedBuilders: BuildBattleSpeedBuilders;

  @Field({ historical: { enabled: false } })
  public coins: number;

  @Field()
  public score: number;

  @Field()
  public correctGuesses: number;

  @Field()
  public votes: number;

  @Field({ historical: { enabled: false } })
  public superVotes: number;

  @Field({ store: { default: defaultPrefix(titles) } })
  public titleFormatted: string;

  @Field({ store: { default: defaultPrefix(titles) } })
  public naturalTitleFormatted: string;

  @Field()
  public nextTitleFormatted: string;

  @Field()
  public progression: Progression;

  public constructor(data: APIData, achievements: APIData) {
    this.overall = new BuildBattleOverall(data);

    this.solo = new BuildBattleMultiplayerMode(data, "solo");
    this.teams = new BuildBattleMultiplayerMode(data, "teams");

    this.pro = new BuildBattlePro(data);
    this.guessTheBuild = new BuildBattleGuessTheBuild(data);
    this.speedBuilders = new BuildBattleSpeedBuilders(data, achievements);

    this.coins = data.coins;
    this.score = data.score;

    this.correctGuesses = data.correct_guesses;
    this.votes = data.total_votes;
    this.superVotes = data.super_votes;

    this.naturalTitleFormatted = getFormattedPrefix({ prefixes: titles, score: this.score });

    const emblemColor = new Color(data.emblem?.selected_color ?? "WHITE");
    const emblemSymbol = data.emblem?.selected_icon;
    const emblemFormatted = `${emblemColor.code}${EMBLEM_MAP[emblemSymbol] ?? ""}${EMBLEM_MAP[emblemSymbol] ? " " : ""}`;

    this.titleFormatted = `${emblemFormatted}${this.naturalTitleFormatted}`;

    this.nextTitleFormatted = getFormattedPrefix({
      prefixes: titles,
      score: this.score,
      skip: true,
    });

    this.progression = createPrefixProgression(titles, this.score);
  }
}

const EMBLEM_MAP: Record<string, string> = {
  REMINISCENCE: "≈",
  ALPHA: "α",
  OMEGA: "Ω",
  RICH: "$",
  PODIUM: "π",
  FLORIN: "ƒ",
};

export * from "./mode.js";
