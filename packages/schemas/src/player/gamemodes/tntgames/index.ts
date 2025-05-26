/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { BowSpleef, PVPRun, TNTRun, TNTTag, Wizards } from "./mode.js";
import { type ExtractGameModes, GameModes } from "#game";
import { Field } from "#metadata";
import type { APIData } from "@statsify/util";

export const TNT_GAMES_MODES = new GameModes([
  { api: "overall" },
  { api: "tntRun", hypixel: "TNTRUN", formatted: "TNT Run" },
  { api: "pvpRun", hypixel: "PVPRUN", formatted: "PVP Run" },
  { api: "bowSpleef", hypixel: "BOWSPLEEF" },
  { api: "tntTag", hypixel: "TNTAG", formatted: "TNT Tag" },
  {
    api: "wizards",
    hypixel: "CAPTURE",
    submodes: [
      { api: "overall" },
      { api: "fireWizard" },
      { api: "iceWizard" },
      { api: "witherWizard" },
      { api: "kineticWizard" },
      { api: "bloodWizard" },
      { api: "toxicWizard" },
      { api: "hydroWizard" },
      { api: "ancientWizard" },
      { api: "stormWizard" },
      { api: "arcaneWizard" },
    ],
  },
] as const);

export type TNTGamesModes = ExtractGameModes<typeof TNT_GAMES_MODES>;

export class TNTGames {
  @Field({ historical: { enabled: false } })
  public coins: number;

  @Field()
  public wins: number;

  @Field({
    leaderboard: { fieldName: "TNT Run", extraDisplay: "this.tntRun.naturalPrefix" },
  })
  public tntRun: TNTRun;

  @Field({ leaderboard: { fieldName: "PVP Run", extraDisplay: "this.pvpRun.naturalPrefix" } })
  public pvpRun: PVPRun;

  @Field({ leaderboard: { extraDisplay: "this.bowSpleef.naturalPrefix" } })
  public bowSpleef: BowSpleef;

  @Field({ leaderboard: { extraDisplay: "this.wizards.naturalPrefix" } })
  public wizards: Wizards;

  @Field({ leaderboard: { fieldName: "TNT Tag", extraDisplay: "this.tntTag.naturalPrefix" } })
  public tntTag: TNTTag;

  public constructor(data: APIData, ap: APIData) {
    this.coins = data.coins;
    this.wins = data.wins;

    this.tntRun = new TNTRun(data, ap);
    this.pvpRun = new PVPRun(data);
    this.bowSpleef = new BowSpleef(data);
    this.wizards = new Wizards(data, ap);
    this.tntTag = new TNTTag(data, ap);
  }
}

export * from "./mode.js";
