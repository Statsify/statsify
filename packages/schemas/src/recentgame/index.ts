import { APIData } from '@statsify/util';
import { Field } from '../decorators';
import { Game } from '../game';

export class RecentGame {
  @Field({ store: false })
  public startedAt: number;

  @Field({ store: false })
  public game: Game;

  @Field({ store: false, required: false })
  public mode?: string;

  @Field({ store: false, required: false })
  public map?: string;

  @Field({ store: false, required: false })
  public endedAt?: number;

  @Field({ store: false, required: false })
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
