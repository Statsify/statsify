import { APIData } from '@statsify/util';
import { Color } from '../color';
import { Field } from '../decorators';
import { PlayerStats } from './stats';
import { PlayerUtil } from './util';

export class Player {
  @Field({ unique: true, index: true, required: true })
  public uuid: string;

  @Field()
  public username: string;

  @Field({ index: true, lowercase: true, required: true })
  public usernameToLower: string;

  @Field({ leaderboard: false })
  public firstLogin: number;

  @Field({ leaderboard: false })
  public lastLogin: number;

  @Field({ leaderboard: false })
  public lastLogout: number;

  @Field()
  public online: boolean;

  @Field({ default: 'Unknown' })
  public version: string;

  @Field({ default: 'DEFAULT' })
  public rank: string;

  @Field()
  public plusColor: Color;

  @Field({
    description: "The player's name with their rank color as seen in game lobbies",
    example: '§bj4cobi',
  })
  public prefixName: string;

  @Field({
    description: "The player's name with their formatted rank",
    example: '§b[MVP§c+] j4cobi',
  })
  public displayName: string;

  @Field()
  public stats: PlayerStats;

  @Field({ leaderboard: false, description: "The time the player's cache expires " })
  public expiresAt: number;

  @Field({ leaderboard: false, description: "The time the player's historical stats reset" })
  public resetMinute: number;

  @Field()
  public leaderboardBanned: boolean;

  public constructor(data: APIData = {}) {
    this.uuid = data.uuid;
    this.username = data.displayname;
    this.usernameToLower = this.username?.toLowerCase();

    this.firstLogin = parseInt(data._id?.substring(0, 8) ?? 0, 16) * 1000;
    this.lastLogin = data.lastLogin ?? 0;
    this.lastLogout = data.lastLogout ?? 0;

    this.online = this.lastLogin > this.lastLogout;
    this.version = data.mcVersionRp ?? 'Unknown';

    this.rank = PlayerUtil.getRank(data);
    this.plusColor = PlayerUtil.getPlusColor(this.rank, data?.rankPlusColor);
    this.prefixName = `${PlayerUtil.getRankColor(this.rank).toString()}${this.username}`;
    this.displayName = PlayerUtil.getDisplayName(this.username, this.rank, this.plusColor.code);

    this.stats = new PlayerStats(data);

    this.expiresAt = 0;
    this.resetMinute = 0;
    this.leaderboardBanned = false;
  }
}
