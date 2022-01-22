import { APIData } from '@statsify/util';
import { Field } from '../decorators';

export class Achievements {
  @Field({ leaderboard: false })
  public playerCount: number;

  @Field()
  public dailyGuildWins: number;

  @Field()
  public dailyGexp: number;

  public constructor(data: APIData) {
    this.playerCount = data.ONLINE_PLAYERS;
    this.dailyGuildWins = data.WINNERS;
    this.dailyGexp = data.EXPERIENCE_KINGS;
  }
}
