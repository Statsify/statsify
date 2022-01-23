import { APIData } from '@statsify/util';
import { Field } from '../decorators';
import { Game } from '../game';

export class Status {
  @Field()
  public online: boolean;

  @Field()
  public game: Game;

  @Field({ required: false })
  public mode?: string;

  @Field({ required: false })
  public map?: string;

  public constructor(data: APIData) {
    this.online = data.online;
    this.game = new Game(data.gameType ?? 'LIMBO');
    this.mode = data.mode;
    this.map = data.map;
  }
}
