/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { APIData, removeFormatting } from "@statsify/util";
import { Field } from "../../../../../metadata";
import { FormattedGame } from "../../../../../game";
import { add } from "@statsify/math";
import { challengeFieldData } from "../util";
import type { GameChallenges } from "../game-challenges";

export class ArcadeChallenges implements GameChallenges {
  @Field(challengeFieldData)
  public farmHunt: number;

  @Field(challengeFieldData)
  public blockingDead: number;

  @Field(challengeFieldData)
  public bountyHunters: number;

  @Field(challengeFieldData)
  public creeperAttack: number;

  @Field(challengeFieldData)
  public dragonWars: number;

  @Field(challengeFieldData)
  public enderSpleef: number;

  @Field(challengeFieldData)
  public galaxyWars: number;

  @Field(challengeFieldData)
  public throwOut: number;

  @Field(challengeFieldData)
  public holeInTheWall: number;

  @Field(challengeFieldData)
  public hypixelSays: number;

  @Field(challengeFieldData)
  public pixelPainters: number;

  @Field(challengeFieldData)
  public partyGames: number;

  @Field(challengeFieldData)
  public football: number;

  @Field(challengeFieldData)
  public miniWalls: number;

  @Field(challengeFieldData)
  public captureTheWool: number;

  @Field(challengeFieldData)
  public zombies: number;

  @Field(challengeFieldData)
  public hideAndSeek: number;

  @Field({
    leaderboard: {
      fieldName: `${removeFormatting(FormattedGame.ARCADE)} Total`,
      name: "Total",
    },
  })
  public total: number;

  public constructor(challenges: APIData) {
    this.farmHunt = challenges.ARCADE__farm_hunt_challenge;
    this.blockingDead = challenges.ARCADE__blocking_dead_challenge;
    this.bountyHunters = challenges.ARCADE__bounty_hunter_challenge;
    this.creeperAttack = challenges.ARCADE__creeper_attack_challenge;
    this.dragonWars = challenges.ARCADE__dragon_wars_challenge;
    this.enderSpleef = challenges.ARCADE__ender_spleef_challenge;
    this.galaxyWars = challenges.ARCADE__galaxy_wars_challenge;
    this.throwOut = challenges.ARCADE__throw_out_challenge;
    this.holeInTheWall = challenges.ARCADE__hole_in_the_wall_challenge;
    this.hypixelSays = challenges.ARCADE__hypixel_says_challenge;
    this.pixelPainters = challenges.ARCADE__pixel_painters_challenge;
    this.partyGames = challenges.ARCADE__party_games_challenge;
    this.football = challenges.ARCADE__football_challenge;
    this.miniWalls = challenges.ARCADE__mini_walls_challenge;
    this.captureTheWool = challenges.ARCADE__capture_the_wool_challenge;
    this.zombies = challenges.ARCADE__zombies_challenge;
    this.hideAndSeek = challenges.ARCADE__hide_and_seek_challenge;

    this.total = add(
      this.farmHunt,
      this.blockingDead,
      this.bountyHunters,
      this.creeperAttack,
      this.dragonWars,
      this.enderSpleef,
      this.galaxyWars,
      this.throwOut,
      this.holeInTheWall,
      this.hypixelSays,
      this.pixelPainters,
      this.partyGames,
      this.football,
      this.miniWalls,
      this.captureTheWool,
      this.zombies,
      this.hideAndSeek
    );
  }
}
