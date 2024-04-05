/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { CopsAndCrimsOverall, Deathmatch, Defusal, GunGame } from "./mode.js";
import { Field } from "#metadata";
import { GameModes, type IGameModes } from "#game";
import { GamePrefix, defaultPrefix, getFormattedPrefix } from "#prefixes";
import { add } from "@statsify/math";
import type { APIData } from "@statsify/util";

export const COPS_AND_CRIMS_MODES = new GameModes([
  { api: "overall" },
  { api: "defusal", hypixel: "normal" },
  { api: "deathmatch", hypixel: "deathmatch" },
  { api: "gunGame", hypixel: "gungame" },
  { hypixel: "normal_party", formatted: "Challenge" },
]);

export type CopsAndCrimsModes = IGameModes<typeof COPS_AND_CRIMS_MODES>;

type PrefixParams = [kills: number, prefix: string];

const prefixes: GamePrefix<PrefixParams>[] = [
  { req: 0, fmt: (_, kills, prefix) => `§7[${kills}${prefix}]` },
  { req: 1, fmt: (_, kills, prefix) => `§f[${kills}${prefix}]` },
  { req: 2, fmt: (_, kills, prefix) => `§e[${kills}${prefix}]` },
  { req: 3, fmt: (_, kills, prefix) => `§6[${kills}${prefix}]` },
  { req: 4, fmt: (_, kills, prefix) => `§3[${kills}${prefix}]` },
  { req: 5, fmt: (_, kills, prefix) => `§c[${kills}${prefix}]` },
];

const PREFIX_COLORS: Record<string, number> = {
  GRAY: 0,
  WHITE: 1,
  YELLOW: 2,
  GOLD: 3,
  AQUA: 4,
  RED: 5,
};

const PREFIX_MAP: Record<string, string> = {
  helmet: "ᨽ",
  armor: "ᨾ",
  knife: "ᨯ",
  msg: "ᨢ",
  pistol: "ᨠ",
  grenade: "ᨬ",
  firebomb: "ᨹ",
  c4: "ᨶ",
  defuse: "ᨻ",
  headshot: "ᨰ",
  hp: "ᩀ",
  fire: "ᨳ",
  crims: "ᩑ",
  cops: "ᩐ",
  bullpup: "ᩒᩓ",
  scopedRifle: "ᩖᩗ",
  autoShotgun: "ᩚᩛ",
  handgun: "ᩞ",
  sniper: "ᨪᨫ",
  magnum: "ᨡ",
  carbine: "ᨦᨧ",
};

export class CopsAndCrims {
  @Field({ historical: { enabled: false } })
  public coins: number;

  @Field({
    store: { default: defaultPrefix(prefixes, { prefixParams: [0, PREFIX_MAP.helmet] }) },
  })
  public naturalPrefix: string;

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
    this.overall = new CopsAndCrimsOverall(this.defusal, this.deathmatch, this.gunGame);

    const prefixParams: PrefixParams = [
      this.overall.kills,
      PREFIX_MAP[data.selected_lobby_prefix ?? "helmet"],
    ];

    const score = PREFIX_COLORS[data.lobbyPrefixColor ?? "GRAY"] ?? 0;

    this.naturalPrefix = getFormattedPrefix({
      prefixes,
      score,
      trueScore: true,
      prefixParams,
    });
  }
}

export * from "./mode.js";
