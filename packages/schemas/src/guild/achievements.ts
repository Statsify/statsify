import { APIData } from '@statsify/util';
import { Field } from '../metadata';

/**
 * Better names for the guild achievements
 */
export class Achievements {
  @Field({ leaderboard: { enabled: false } })
  public maxOnlinePlayerCount: number;

  @Field()
  public dailyGuildWins: number;

  @Field()
  public dailyGexp: number;

  public constructor(data: APIData) {
    this.maxOnlinePlayerCount = data.ONLINE_PLAYERS;
    this.dailyGuildWins = data.WINNERS;
    this.dailyGexp = data.EXPERIENCE_KINGS;
  }
}
