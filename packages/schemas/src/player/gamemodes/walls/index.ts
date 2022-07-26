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
import {
  GamePrefix,
  createPrefixProgression,
  defaultPrefix,
  getFormattedPrefix,
  rainbow,
} from "../prefixes";
import { Progression } from "../../../progression";
import { ratio } from "@statsify/math";

export const WALLS_MODES = new GameModes([{ api: "overall" }]);

export type WallsModes = IGameModes<typeof WALLS_MODES>;

const prefixes: GamePrefix[] = [
  { fmt: (n) => `§8[${n}]`, req: 0 },
  { fmt: (n) => `§7[${n}]`, req: 25 },
  { fmt: (n) => `§6[${n}]`, req: 50 },
  { fmt: (n) => `§a[${n}]`, req: 100 },
  { fmt: (n) => `§2[${n}]`, req: 200 },
  { fmt: (n) => `§9[${n}]`, req: 300 },
  { fmt: (n) => `§1[${n}]`, req: 400 },
  { fmt: (n) => `§d[${n}]`, req: 500 },
  { fmt: (n) => `§4[${n}]`, req: 750 },
  { fmt: (n) => `§6[${n}]`, req: 1000 },
  { fmt: (n) => `§0§l[${n}]`, req: 2000 },
  { fmt: (n) => rainbow(`[${n}]`), req: 2001 },
];

export class Walls {
  @Field()
  public coins: number;

  @Field()
  public wins: number;

  @Field()
  public losses: number;

  @Field()
  public wlr: number;

  @Field()
  public kills: number;

  @Field()
  public deaths: number;

  @Field()
  public kdr: number;

  @Field()
  public assists: number;

  @Field()
  public tokens: number;

  @Field()
  public progression: Progression;

  @Field()
  public currentPrefix: string;

  @Field({ store: { default: defaultPrefix(prefixes) } })
  public naturalPrefix: string;

  @Field()
  public nextPrefix: string;

  public constructor(data: APIData, legacy: APIData) {
    this.coins = data.coins;
    this.wins = data.wins;
    this.losses = data.losses;
    this.wlr = ratio(this.wins, this.losses);
    this.kills = data.kills;
    this.deaths = data.deaths;
    this.kdr = ratio(this.kills, this.deaths);
    this.assists = data.assists;
    this.tokens = legacy.walls_tokens;

    const score = this.wins;

    this.currentPrefix = getFormattedPrefix({ prefixes, score });

    this.naturalPrefix = getFormattedPrefix({
      prefixes,
      score,
      trueScore: true,
    });

    this.nextPrefix = getFormattedPrefix({
      prefixes,
      score,
      skip: true,
    });

    this.progression = createPrefixProgression(prefixes, score);
  }
}
