/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ArenaBrawlMode } from "./mode.js";
import { Field } from "#metadata";
import { GameModes, type IGameModes } from "#game";
import {
  GamePrefix,
  createPrefixProgression,
  defaultPrefix,
  getFormattedPrefix,
  rainbow,
} from "#prefixes";
import { Progression } from "#progression";
import { deepAdd } from "@statsify/math";
import type { APIData } from "@statsify/util";

export const ARENA_BRAWL_MODES = new GameModes([
  { api: "overall" },
  { api: "solo" },
  { api: "doubles" },
  { api: "fours" },
]);

const prefixes: GamePrefix[] = [
  { fmt: (n) => `§8[${n}]`, req: 0 },
  { fmt: (n) => `§7[${n}]`, req: 500 },
  { fmt: (n) => `§a[${n}]`, req: 1000 },
  { fmt: (n) => `§2[${n}]`, req: 2000 },
  { fmt: (n) => `§d[${n}]`, req: 3000 },
  { fmt: (n) => `§5[${n}]`, req: 4000 },
  { fmt: (n) => `§c[${n}]`, req: 5000 },
  { fmt: (n) => `§4[${n}]`, req: 7500 },
  { fmt: (n) => `§6[${n}]`, req: 10_000 },
  { fmt: (n) => rainbow(`[${n}]`), req: 15_000 },
];

export type ArenaBrawlModes = IGameModes<typeof ARENA_BRAWL_MODES>;

export class ArenaBrawl {
  @Field()
  public progression: Progression;

  @Field()
  public currentPrefix: string;

  @Field({ store: { default: defaultPrefix(prefixes) } })
  public naturalPrefix: string;

  @Field()
  public nextPrefix: string;

  @Field()
  public overall: ArenaBrawlMode;

  @Field()
  public solo: ArenaBrawlMode;

  @Field()
  public doubles: ArenaBrawlMode;

  @Field()
  public fours: ArenaBrawlMode;

  @Field()
  public magicalChests: number;

  @Field({ store: { default: "none" } })
  public offensive: string;

  @Field({ store: { default: "none" } })
  public utility: string;

  @Field({ store: { default: "none" } })
  public ultimate: string;

  @Field({ store: { default: "none" } })
  public support: string;

  @Field({ store: { default: "none" } })
  public rune: string;

  @Field({ historical: { enabled: false } })
  public coins: number;

  @Field({ historical: { enabled: false } })
  public keys: number;

  @Field({ historical: { enabled: false } })
  public tokens: number;

  public constructor(data: APIData, legacy: APIData) {
    this.solo = new ArenaBrawlMode(data, "1v1");
    this.doubles = new ArenaBrawlMode(data, "2v2");
    this.fours = new ArenaBrawlMode(data, "4v4");
    this.overall = deepAdd(this.solo, this.doubles, this.fours);

    const score = this.overall.wins;

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

    ArenaBrawlMode.applyRatios(this.overall);

    this.offensive = data.offensive || "none";
    this.utility = data.utility || "none";
    this.ultimate = data.ultimate || "none";
    this.support = data.support || "none";
    this.rune = data.active_rune || "none";
    this.keys = data.keys;
    this.magicalChests = data.magical_chest;
    this.coins = data.coins;
    this.tokens = legacy.arena_tokens;
  }
}

export * from "./mode.js";
