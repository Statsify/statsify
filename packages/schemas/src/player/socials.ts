import { APIData } from '@statsify/util';
import { Field } from '../decorators';

export class PlayerSocials {
  @Field({ required: false })
  public discord?: string;
  @Field({ required: false })
  public forums?: string;

  @Field({ required: false })
  public instagram?: string;

  @Field({ required: false })
  public twitch?: string;

  @Field({ required: false })
  public twitter?: string;

  @Field({ required: false })
  public youtube?: string;

  public constructor(data: APIData) {
    this.discord = data.DISCORD;
    this.forums = data.HYPIXEL;
    this.instagram = data.INSTAGRAM;
    this.twitch = data.TWITCH;
    this.twitter = data.TWITTER;
    this.youtube = data.YOUTUBE;
  }
}
