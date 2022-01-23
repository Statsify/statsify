import { APIData } from '@statsify/util';
import { Field } from '../decorators';
import { Game } from '../game';

export class RecentGame {
  @Field({ store: false })
  public startedAt: number;

  @Field()
  public game: Game;

  @Field({ required: false })
  public mode?: string;

  @Field({ required: false })
  public map?: string;

  @Field({ required: false })
  public endedAt?: number;

  @Field({ required: false })
  public gameLength?: number;

  public constructor(data: APIData = {}) {
    this.startedAt = data.date;
    this.game = new Game(data.gameType);
    this.mode = data.mode;
    this.map = data.map;
    this.endedAt = data.ended;

    if (this.endedAt) {
      this.gameLength = this.endedAt - this.startedAt;
    }
  }
}
