/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { APIData } from "@statsify/util";
import { CopsAndCrimsOverall, Deathmatch, Defusal, GunGame } from "./mode";
import { Field } from "../../../metadata";
import { GameModes } from "../../../game";
import { GamePrefix, defaultPrefix, getFormattedPrefix } from "../prefixes";
import {
  GameType,
  GetMetadataModes,
  Mode,
  StatsifyApiModes,
} from "../../../metadata/GameType";
import { add } from "@statsify/math";

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

@GameType()
export class CopsAndCrims {
  @Field()
  public coins: number;

  @Field({
    store: { default: defaultPrefix(prefixes, { prefixParams: [0, PREFIX_MAP.helmet] }) },
  })
  public naturalPrefix: string;

  @Mode()
  @Field()
  public overall: CopsAndCrimsOverall;

  @Mode("normal")
  @Field()
  public defusal: Defusal;

  @Mode("deathmatch")
  @Field()
  public deathmatch: Deathmatch;

  @Mode("gungame")
  @Field()
  public gunGame: GunGame;

  public constructor(data: APIData) {
    this.coins = data.coins;

    this.defusal = new Defusal(data);
    this.deathmatch = new Deathmatch(data);
    this.gunGame = new GunGame(data);
    this.overall = new CopsAndCrimsOverall(this.defusal, this.deathmatch, this.gunGame);

    const scoreKills = add(this.defusal.kills, this.deathmatch.kills);

    const prefixParams: PrefixParams = [
      scoreKills,
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

export type CopsAndCrimsModes = StatsifyApiModes<CopsAndCrims>;
export const COPS_AND_CRIMS_MODES = new GameModes<CopsAndCrimsModes>([
  ...GetMetadataModes(CopsAndCrims),
  { hypixel: "normal_party", formatted: "Challenge" },
]);

export * from "./mode";
