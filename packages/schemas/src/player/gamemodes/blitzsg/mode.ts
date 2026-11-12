/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Field } from "#metadata";
import { add, ratio } from "@statsify/math";
import { type APIData, formatTime } from "@statsify/util";

export class BlitzSGMode {
  @Field()
  public wins: number;

  @Field()
  public kills: number;

  public constructor(data: APIData, mode: string) {
    mode = mode ? `_${mode}` : mode;

    this.wins = data[`wins${mode || "_solo_normal"}`];
    this.kills = data[`kills${mode}`];
  }
}

export class BlitzSGOverall {
  @Field()
  public wins: number;

  @Field()
  public kills: number;

  @Field()
  public deaths: number;

  @Field()
  public kdr: number;

  @Field()
  public gamesPlayed: number;

  @Field({ leaderboard: { formatter: formatTime }, historical: { enabled: false } })
  public playtime: number;

  @Field()
  public damage: number;

  @Field()
  public damageTaken: number;

  @Field()
  public arrowsHit: number;

  @Field()
  public arrowsFired: number;

  @Field()
  public chestsOpened: number;

  @Field()
  public potionsDrunk: number;

  @Field()
  public potionsThrown: number;

  @Field()
  public mobsSpawned: number;

  @Field()
  public tauntKills: number;

  @Field()
  public blitzStarUses: number;

  public constructor(data: APIData) {
    this.wins = add(data.wins_solo_normal, data.wins_teams_normal);
    this.kills = data.kills;
    this.deaths = data.deaths;
    this.kdr = ratio(this.kills, this.deaths);

    this.gamesPlayed = data.games_played;
    this.playtime = (data.time_played ?? 0) * 1000;
    this.damage = data.damage;
    this.damageTaken = data.damage_taken;
    this.arrowsHit = data.arrows_hit;
    this.arrowsFired = data.arrows_fired;
    this.chestsOpened = data.chests_opened;
    this.potionsDrunk = data.potions_drunk;
    this.potionsThrown = data.potions_thrown;
    this.mobsSpawned = data.mobs_spawned;
    this.tauntKills = data.taunt_kills;
    this.blitzStarUses = data.blitz_uses;
  }
}
