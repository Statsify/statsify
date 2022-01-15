import type { APIData } from '@statsify/util';
import { Field } from '../decorators';

export class Player {
  @Field({ unique: true, index: true })
  public uuid: string;

  @Field()
  public username: string;

  @Field({ index: true, lowercase: true })
  public usernameToLower: string;

  @Field({ leaderboard: false })
  public firstLogin: number;

  @Field({ leaderboard: false })
  public lastLogin: number;

  @Field({ leaderboard: false })
  public lastLogout: number;

  @Field({ default: 'Unknown' })
  public version: string;

  @Field()
  public rank: string;

  @Field()
  public prefixName: string;

  @Field()
  public displayName: string;

  @Field({ leaderboard: false })
  public expiresAt: number;

  @Field({ leaderboard: false })
  public resetMinute: number;

  @Field()
  public leaderboardBanned: boolean;

  public constructor(data: APIData = {}) {
    this.uuid = data.uuid;
    this.username = data.displayname;
    this.usernameToLower = this.username?.toLowerCase();

    this.firstLogin = parseInt(data._id?.substring(0, 8) ?? 0, 16) * 1000;
    this.lastLogin = data.lastLogin;
    this.lastLogout = data.lastLogout;

    this.version = data.mcVersionRp ?? 'Unknown';
  }
}
