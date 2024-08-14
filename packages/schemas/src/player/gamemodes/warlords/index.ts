/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Field } from "#metadata";
import { GameModes, type IGameModes } from "#game";
import { WarlordsCaptureTheFlag, WarlordsDomination, WarlordsTeamDeathmatch } from "./mode.js";
import { WarlordsMage, WarlordsPaladin, WarlordsShaman, WarlordsWarrior } from "./class.js";
import { add, ratio, sub } from "@statsify/math";
import type { APIData } from "@statsify/util";

export const WARLORDS_MODES = new GameModes([
  { api: "overall" },

  { api: "mage" },
  { api: "warrior" },
  { api: "paladin" },
  { api: "shaman" },

  { hypixel: "ctf_mini", formatted: "Capture the Flag" },
  { hypixel: "domination", formatted: "Domination" },
  { hypixel: "team_deathmatch", formatted: "Team Deathmatch" },
]);

export type WarlordsModes = IGameModes<typeof WARLORDS_MODES>;

// flag_conquer_self
// flag_returns

export class Warlords {
  @Field({ store: { default: "warrior" } })
  public class: string;

  @Field({ historical: { enabled: false } })
  public coins: number;

  @Field()
  public mage: WarlordsMage;

  @Field()
  public warrior: WarlordsWarrior;

  @Field()
  public paladin: WarlordsPaladin;

  @Field()
  public shaman: WarlordsShaman;

  @Field()
  public domination: WarlordsDomination;

  @Field()
  public captureTheFlag: WarlordsCaptureTheFlag;

  @Field()
  public teamDeathmatch: WarlordsTeamDeathmatch;

  @Field()
  public gamesPlayed: number;

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

  public constructor(data: APIData) {
    this.class = data.chosen_class || "warrior";
    this.coins = data.coins;

    this.mage = new WarlordsMage(data);
    this.warrior = new WarlordsWarrior(data);
    this.paladin = new WarlordsPaladin(data);
    this.shaman = new WarlordsShaman(data);

    this.domination = new WarlordsDomination(data);
    this.captureTheFlag = new WarlordsCaptureTheFlag(data);
    this.teamDeathmatch = new WarlordsTeamDeathmatch(data);

    this.gamesPlayed = Math.ceil(
      add(
        data.aquamancer_plays,
        data.avenger_plays,
        data.berserker_plays,
        data.crusader_plays,
        data.cryomancer_plays,
        data.defender_plays,
        data.earthwarden_plays,
        data.mage_plays,
        data.paladin_plays,
        data.protector_plays,
        data.pyromancer_plays,
        data.revenant_plays,
        data.shaman_plays,
        data.spiritguard_plays,
        data.thunderlord_plays,
        data.warrior_plays
      ) / 2
    );
    this.wins = data.wins;

    // Warlords Losses in API are bugged (~90% accurate)
    // https://hypixel.net/threads/warlords-skillrating-website.1560046/post-12210896
    this.losses = sub(this.gamesPlayed, this.wins);
    this.wlr = ratio(this.wins, this.losses);

    this.kills = data.kills;
    this.deaths = data.deaths;
    this.kdr = ratio(this.kills, this.deaths);
    this.assists = data.assists;
  }
}

export * from "./class.js";
