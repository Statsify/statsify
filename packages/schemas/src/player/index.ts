import { APIData } from '@statsify/util';
import { modelOptions as ModelOptions, Severity } from '@typegoose/typegoose';
import { Color } from '../color';
import { Field } from '../metadata';
import { PlayerSocials } from './socials';
import { PlayerStats } from './stats';
import { PlayerStatus } from './status';
import { PlayerUtil } from './util';

@ModelOptions({ options: { allowMixed: Severity.ALLOW } })
export class Player {
  @Field({ mongo: { unique: true, index: true }, store: { required: true } })
  public uuid: string;

  @Field({ mongo: { unique: true, index: true }, store: { required: true } })
  public shortUuid: string;

  @Field()
  public username: string;

  @Field({ mongo: { index: true, lowercase: true }, store: { required: true } })
  public usernameToLower: string;

  @Field({ store: { default: 'DEFAULT' } })
  public rank: string;

  @Field()
  public plusColor: Color;

  @Field({
    docs: {
      description: "The player's name with their rank color as seen in game lobbies",
      examples: ['§bj4cobi'],
    },
  })
  public prefixName: string;

  @Field({
    docs: {
      description: "The player's name with their formatted rank",
      examples: ['§b[MVP§c+] j4cobi'],
    },
  })
  public displayName: string;

  @Field()
  public socials: PlayerSocials;

  @Field()
  public stats: PlayerStats;

  @Field()
  public status: PlayerStatus;

  @Field({ type: () => [String] })
  public oneTimeAchievements: string[];

  @Field({ leaderboard: { enabled: false }, store: { serialize: false } })
  public tieredAchievements: Record<string, number>;

  @Field()
  public goldAchievements: boolean;

  @Field({
    leaderboard: { enabled: false },
    docs: { description: "The time the player's cache expires" },
  })
  public expiresAt: number;

  @Field({
    leaderboard: { enabled: false },
    store: { required: false },
    docs: { description: "The time the player's historical stats reset" },
  })
  public resetMinute?: number;

  @Field({ store: { required: false } })
  public leaderboardBanned?: boolean;

  @Field({ store: { required: false, store: false } })
  public cached?: boolean;

  public constructor(data: APIData = {}) {
    this.uuid = data.uuid;
    this.username = data.displayname;
    this.usernameToLower = this.username?.toLowerCase();

    this.rank = PlayerUtil.getRank(data);
    this.plusColor = PlayerUtil.getPlusColor(this.rank, data?.rankPlusColor);
    this.prefixName = `${PlayerUtil.getRankColor(this.rank).toString()}${this.username}`;
    this.displayName = PlayerUtil.getDisplayName(this.username, this.rank, this.plusColor.code);

    this.socials = new PlayerSocials(data?.socialMedia?.links ?? {});

    this.stats = new PlayerStats(data);

    this.status = new PlayerStatus(data);

    this.oneTimeAchievements = data?.achievementsOneTime ?? [];
    this.tieredAchievements = data?.achievements ?? {};
    this.goldAchievements = data?.vanityMeta?.packages?.includes('goldachievementmenu') ?? false;

    //These will all be filled in by a service
    this.expiresAt = 0;
    this.resetMinute = 0;
    this.leaderboardBanned = false;
  }
}

export * from './socials';
export * from './stats';
export * from './status';
