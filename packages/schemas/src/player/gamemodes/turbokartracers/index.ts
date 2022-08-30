/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Field } from "#metadata";
import { GameModes, IGameModes } from "#game";
import {
  GamePrefix,
  createPrefixProgression,
  defaultPrefix,
  getFormattedPrefix,
} from "#prefixes";
import { Progression } from "#progression";
import { add, ratio } from "@statsify/math";
import type { APIData } from "@statsify/util";

export const TURBO_KART_RACERS_MODES = new GameModes([{ api: "overall" }]);

export type TurboKartRacersModes = IGameModes<typeof TURBO_KART_RACERS_MODES>;

const prefixes: GamePrefix[] = [
  { fmt: (n) => `§8[${n}✪]`, req: 0 },
  { fmt: (n) => `§7[${n}✪]`, req: 5 },
  { fmt: (n) => `§f[${n}✪]`, req: 25 },
  { fmt: (n) => `§b[${n}✪]`, req: 50 },
  { fmt: (n) => `§a[${n}✪]`, req: 100 },
  { fmt: (n) => `§e[${n}✪]`, req: 200 },
  { fmt: (n) => `§9[${n}✪]`, req: 300 },
  { fmt: (n) => `§d[${n}✪]`, req: 400 },
  { fmt: (n) => `§6[${n}✪]`, req: 500 },
  { fmt: (n) => `§2[${n}✪]`, req: 750 },
  { fmt: (n) => `§1[${n}✪]`, req: 1000 },
  { fmt: (n) => `§5[${n}✪]`, req: 2500 },
  { fmt: (n) => `§4[${n}✪]`, req: 5000 },
  { fmt: (n) => `§0[${n}✪]`, req: 10_000 },
];

export class TurboKartRacers {
  @Field()
  public coins: number;

  @Field()
  public tokens: number;

  @Field({ leaderboard: { enabled: false } })
  public grandPrixTokens: number;

  @Field()
  public lapsCompleted: number;

  @Field({ leaderboard: { enabled: false } })
  public boxesPickedUp: number;

  @Field({ leaderboard: { enabled: false } })
  public coinsPickedUp: number;

  @Field()
  public gamesPlayed: number;

  @Field({ leaderboard: { additionalFields: ["this.total"] } })
  public gold: number;

  @Field({ leaderboard: { additionalFields: ["this.total"] } })
  public silver: number;

  @Field({ leaderboard: { additionalFields: ["this.total"] } })
  public bronze: number;

  @Field({
    leaderboard: { additionalFields: ["this.gold", "this.silver", "this.bronze"] },
  })
  public total: number;

  @Field({ leaderboard: { enabled: false } })
  public trophyRate: number;

  @Field({ leaderboard: { enabled: false } })
  public goldRate: number;

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
    this.tokens = legacy.gingerbread_tokens;

    this.gamesPlayed = add(
      data.retro_plays,
      data.olympus_plays,
      data.canyon_plays,
      data.hypixelgp_plays,
      data.junglerush_plays
    );

    this.grandPrixTokens = data.grand_prix_tokens;
    this.lapsCompleted = data.laps_completed;
    this.boxesPickedUp = data.box_pickups;
    this.coinsPickedUp = data.coins_picked_up;

    this.bronze = data.bronze_trophy;
    this.silver = data.silver_trophy;
    this.gold = data.gold_trophy;
    this.total = add(this.gold, this.silver, this.bronze);

    const score = this.gold;

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

    this.goldRate = ratio(this.gold, this.gamesPlayed, 100);
    this.trophyRate = ratio(this.total, this.gamesPlayed, 100);
  }
}
