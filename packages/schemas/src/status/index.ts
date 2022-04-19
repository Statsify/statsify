import { APIData } from '@statsify/util';
import { Game } from '../game';
import { Field } from '../metadata';

export class Status {
  @Field()
  public online: boolean;

  @Field()
  public game: Game;

  @Field({ store: { required: false } })
  public mode?: string;

  @Field({ store: { required: false } })
  public map?: string;

  public constructor(data: APIData) {
    this.online = data.online;
    this.game = new Game(data.gameType ?? 'LIMBO');
    this.mode = data.mode;
    this.map = data.map;
  }
}
