import { APIData } from '@statsify/util';
import { Field } from '../../../decorators';

export class CopsAndCrims {
  @Field()
  public coins: number;

  @Field()
  public roundWins: number;

  @Field()
  public wins: number;

  @Field()
  public kills: number;

  @Field()
  public copKills: number;

  @Field()
  public criminalKills: number;

  @Field()
  public killsDeathmatch: number;

  @Field()
  public copKillsDeathmatch: number;

  @Field()
  public criminalKillsDeathmatch: number;

  @Field()
  public headshots: number;

  @Field()
  public shotsFired: number;

  @Field()
  public grenadeKills: number;

  @Field()
  public bombsPlanted: number;

  @Field()
  public bombsDefused: number;

  public constructor(data: APIData) {
    this.coins = data.coins;
    this.wins = data.game_wins;
    this.roundWins = data.round_wins;
    this.kills = data.kills;
    this.copKills = data.cop_kills;
    this.criminalKills = data.criminal_kills;
    this.killsDeathmatch = data.kills_deathmatch;
    this.copKillsDeathmatch = data.cop_kills_deathmatch;
    this.criminalKillsDeathmatch = data.criminal_kills_deathmatch;
    this.headshots = data.headshot_kills;
    this.shotsFired = data.shots_fired;
    this.grenadeKills = data.grenade_kills;
    this.bombsPlanted = data.bombs_planted;
    this.bombsDefused = data.bombs_defused;
  }
}
