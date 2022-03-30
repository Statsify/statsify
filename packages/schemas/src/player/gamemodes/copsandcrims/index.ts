import { add } from '@statsify/math';
import { APIData } from '@statsify/util';
import { Field } from '../../../decorators';
import { Deathmatch, Defusal, GunGame } from './mode';

export class CopsAndCrims {
  @Field()
  public coins: number;

  @Field()
  public wins: number;

  @Field()
  public defusal: Defusal;

  @Field()
  public deathmatch: Deathmatch;

  @Field()
  public gunGame: GunGame;

  public constructor(data: APIData) {
    this.coins = data.coins;
    this.wins = add(data.game_wins, data.game_wins_deathmatch, data.game_wins_gungame);

    this.defusal = new Defusal(data);
    this.deathmatch = new Deathmatch(data);
    this.gunGame = new GunGame(data);
  }
}
