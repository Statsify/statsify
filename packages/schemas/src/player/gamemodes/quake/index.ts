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
} from "../prefixes";
import { Progression } from "../../../progression";
import { QuakeMode } from "./mode";
import { deepAdd } from "@statsify/math";

export const QUAKE_MODES = new GameModes([
  { api: "overall" },
  { api: "solo", hypixel: "solo" },
  { api: "teams", hypixel: "teams" },
]);

export type QuakeModes = IGameModes<typeof QUAKE_MODES>;

const indexes = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
];

const prefixes: GamePrefix[] = [
  { fmt: (n) => `§8[${n}]`, req: 0 },
  { fmt: (n) => `§7[${n}]`, req: 25_000 },
  { fmt: (n) => `§f[${n}]`, req: 50_000 },
  { fmt: (n) => `§2[${n}]`, req: 75_000 },
  { fmt: (n) => `§e[${n}]`, req: 100_000 },
  { fmt: (n) => `§a[${n}]`, req: 200_000 },
  { fmt: (n) => `§9[${n}]`, req: 300_000 },
  { fmt: (n) => `§3[${n}]`, req: 400_000 },
  { fmt: (n) => `§d[${n}]`, req: 500_000 },
  { fmt: (n) => `§5[${n}]`, req: 600_000 },
  { fmt: (n) => `§c[${n}]`, req: 750_000 },
  { fmt: (n) => `§6[${n}]`, req: 1_000_000 },
  { fmt: (n) => `§0[${n}]`, req: 2_000_000 },
];

export class Quake {
  @Field()
  public progression: Progression;

  @Field()
  public currentPrefix: string;

  @Field({ store: { default: defaultPrefix(prefixes) } })
  public naturalPrefix: string;

  @Field()
  public nextPrefix: string;

  @Field()
  public overall: QuakeMode;

  @Field()
  public solo: QuakeMode;

  @Field()
  public teams: QuakeMode;

  @Field({ leaderboard: { historical: false } })
  public coins: number;

  @Field({ leaderboard: { historical: false } })
  public highestKillstreak: number;

  @Field()
  public godlikes: number;

  @Field({ leaderboard: { historical: false } })
  public tokens: number;

  @Field({ leaderboard: { enabled: false }, store: { default: 1.3 } })
  public trigger: number;

  public constructor(data: APIData, ap: APIData, legacy: APIData) {
    this.solo = new QuakeMode(data, "");
    this.teams = new QuakeMode(data, "teams");

    this.overall = deepAdd(this.solo, this.teams);

    const score = this.overall.kills;

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

    QuakeMode.applyRatios(this.overall);

    this.coins = data.coins;
    this.highestKillstreak = data.highest_killstreak;
    this.godlikes = ap.quake_godlikes;
    this.tokens = legacy.quakecraft_tokens;

    // NINE_POINT_ZERO becomes 9.0
    // ALWAYS in seconds
    this.trigger =
      +data.trigger
        ?.toLowerCase()
        .split("_")
        // Converts string numbers to actually number && remove the 'point'
        .map((trigger: string) =>
          indexes.includes(trigger) ? indexes.indexOf(trigger) : "."
        )
        .join("") || 1.3;
  }
}

export * from "./mode";
