import { APIData } from '@statsify/util';
import { Color } from '../color';
import { Field } from '../decorators';
import { Game } from '../game';
import { PlayerSocials } from './socials';
import { PlayerStats } from './stats';
import { PlayerUtil } from './util';

export class Player {
  @Field({ unique: true, index: true, required: true })
  public uuid: string;

  @Field({ unique: true, index: true, required: true })
  public id: string;

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
  public lastGame: Game;

  @Field()
  public socials: PlayerSocials;

  @Field()
  public stats: PlayerStats;

  @Field({ leaderboard: false, description: "The time the player's cache expires " })
  public expiresAt: number;

  @Field({
    leaderboard: false,
    required: false,
    description: "The time the player's historical stats reset",
  })
  public resetMinute?: number;

  @Field({ required: false })
  public leaderboardBanned?: boolean;

  @Field({ required: false })
  public cached?: boolean;

  public constructor(data: APIData = {}) {
    this.uuid = data.uuid;
    this.id = data._id;
    this.username = data.displayname;
    this.usernameToLower = this.username?.toLowerCase();

    //The first login provided by hypixel is not fully accurate for very old players, it is better to ues the `_id` field
    this.firstLogin = parseInt(data._id?.substring(0, 8) ?? 0, 16) * 1000;
    this.lastLogin = data.lastLogin ?? 0;
    this.lastLogout = data.lastLogout ?? 0;

    this.online = this.lastLogin > this.lastLogout;
    this.version = data.mcVersionRp ?? 'Unknown';

    this.rank = PlayerUtil.getRank(data);
    this.plusColor = PlayerUtil.getPlusColor(this.rank, data?.rankPlusColor);
    this.prefixName = `${PlayerUtil.getRankColor(this.rank).toString()}${this.username}`;
    this.displayName = PlayerUtil.getDisplayName(this.username, this.rank, this.plusColor.code);

    this.lastGame = new Game(data.mostRecentGameType ?? 'LIMBO');

    this.socials = new PlayerSocials(data?.socialMedia?.links ?? {});

    this.stats = new PlayerStats(data);

    //These will all be filled in by a service
    this.expiresAt = 0;
    this.resetMinute = 0;
    this.leaderboardBanned = false;
  }
}
