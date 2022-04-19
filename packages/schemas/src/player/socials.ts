import { APIData } from '@statsify/util';
import { Field } from '../metadata';

export class PlayerSocials {
  @Field({ store: { required: false } })
  public discord?: string;
  @Field({ store: { required: false } })
  public forums?: string;

  @Field({ store: { required: false } })
  public instagram?: string;

  @Field({ store: { required: false } })
  public twitch?: string;

  @Field({ store: { required: false } })
  public twitter?: string;

  @Field({ store: { required: false } })
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
