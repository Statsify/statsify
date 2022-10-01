/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { APIData } from "@statsify/util";
import { BowSpleef, PVPRun, TNTRun, TNTTag, Wizards } from "./mode";
import { Field } from "../../../metadata";
import { GameModes } from "../../../game";
import {
  GameType,
  GetMetadataModes,
  Mode,
  StatsifyApiModes,
} from "../../../metadata/GameType";

@GameType("overall")
export class TNTGames {
  @Field()
  public coins: number;

  @Field()
  public wins: number;

  @Field()
  public blocksRan: number;

  @Mode("TNTRUN", "TNT Run")
  @Field({ leaderboard: { fieldName: "TNT Run" } })
  public tntRun: TNTRun;

  @Mode("PVPRUN", "PVP Run")
  @Field({ leaderboard: { fieldName: "PVP Run" } })
  public pvpRun: PVPRun;

  @Mode("BOWSPLEEF", "Bow Spleef")
  @Field()
  public bowSpleef: BowSpleef;

  @Mode("CAPTURE", "Wizards")
  @Field()
  public wizards: Wizards;

  @Mode("TNTAG", "TNT Tag")
  @Field({ leaderboard: { fieldName: "TNT Tag" } })
  public tntTag: TNTTag;

  public constructor(data: APIData, ap: APIData) {
    this.coins = data.coins;
    this.wins = data.wins;
    this.blocksRan = ap.tntgames_block_runner;

    this.tntRun = new TNTRun(data);
    this.pvpRun = new PVPRun(data);
    this.bowSpleef = new BowSpleef(data);
    this.wizards = new Wizards(data);
    this.tntTag = new TNTTag(data, ap);
  }
}

export type TNTGamesModes = StatsifyApiModes<TNTGames, "overall">;
export const TNT_GAMES_MODES = new GameModes<TNTGamesModes>(GetMetadataModes(TNTGames));

export * from "./mode";
