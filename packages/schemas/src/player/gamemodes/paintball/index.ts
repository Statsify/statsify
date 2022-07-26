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
import { PaintballPerks } from "./perks";
import { Progression } from "../../../progression";
import { ratio } from "@statsify/math";

export const PAINTBALL_MODES = new GameModes([{ api: "overall" }]);

export type PaintballModes = IGameModes<typeof PAINTBALL_MODES>;

const prefixes: GamePrefix[] = [
  { fmt: (n) => `§8[${n}]`, req: 0 },
  { fmt: (n) => `§7[${n}]`, req: 1000 },
  { fmt: (n) => `§f[${n}]`, req: 2500 },
  { fmt: (n) => `§2[${n}]`, req: 5000 },
  { fmt: (n) => `§e[${n}]`, req: 10_000 },
  { fmt: (n) => `§a[${n}]`, req: 20_000 },
  { fmt: (n) => `§9[${n}]`, req: 50_000 },
  { fmt: (n) => `§3[${n}]`, req: 75_000 },
  { fmt: (n) => `§d[${n}]`, req: 100_000 },
  { fmt: (n) => `§5[${n}]`, req: 200_000 },
  { fmt: (n) => `§c[${n}]`, req: 500_000 },
  { fmt: (n) => `§6[${n}]`, req: 1_000_000 },
];

export class Paintball {
  @Field()
  public coins: number;

  @Field({ leaderboard: { enabled: false } })
  public forcefieldTime: number;

  @Field()
  public kills: number;

  @Field()
  public deaths: number;

  @Field()
  public killstreaks: number;

  @Field({ leaderboard: { enabled: false } })
  public shotsFired: number;

  @Field({ store: { default: "none" } })
  public hat: string;

  @Field()
  public wins: number;

  @Field()
  public kdr: number;

  @Field({ leaderboard: { enabled: false } })
  public shotAccuracy: number;

  @Field()
  public perks: PaintballPerks;

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
    this.forcefieldTime = (data.forcefieldTime ?? 0) * 1000;
    this.kills = data.kills;
    this.deaths = data.deaths;
    this.killstreaks = data.killstreaks;
    this.shotsFired = data.shots_fired;
    this.wins = data.wins;
    this.hat = data.hat;
    this.kdr = ratio(this.kills, this.deaths);
    this.shotAccuracy = ratio(this.kills, this.shotsFired, 100);
    this.perks = new PaintballPerks(data);
    this.tokens = legacy.paintball_tokens;

    const score = this.kills;

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

export * from "./perks";
