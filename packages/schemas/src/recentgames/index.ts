import { Field } from '../metadata';
import { RecentGame } from './recentgame';

export class RecentGames {
  @Field()
  public uuid: string;

  @Field()
  public displayName: string;

  @Field()
  public games: RecentGame[];
}

export * from './recentgame';
