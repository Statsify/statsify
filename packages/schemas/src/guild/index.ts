import { APIData } from '@statsify/util';
import { Color } from '../color';
import { Field } from '../decorators';
import { GameCode } from '../game';
import { Achievements } from './achievements';
import { ExpByGame } from './expbygame';
import { GuildMember } from './member';
import { GuildRank } from './rank';
import { getLevel } from './util';

export class Guild {
  @Field({ index: true, unique: true, required: true })
  public id: string;

  @Field()
  public name: string;

  @Field({ index: true, lowercase: true, required: true })
  public nameToLower: string;

  @Field()
  public exp: number;

  @Field({ getter: (target: Guild) => getLevel(target.exp).level })
  public level: number;

  @Field({ getter: (target: Guild) => getLevel(target.exp).nextLevelExp })
  public nextLevelExp: number;

  @Field(() => [GuildMember])
  public members: GuildMember[];

  @Field(() => [GuildRank])
  public ranks: GuildRank[];

  @Field()
  public achievements: Achievements;

  @Field(() => [String])
  public preferredGames: GameCode[];

  @Field({ default: true })
  public publiclyListed: boolean;

  @Field()
  public tag: string;

  @Field()
  public tagColor: Color;

  @Field({
    getter: (target: Guild) =>
      target.tag ? `${target.tagColor}[${target.tag}${target.tagColor}]` : '',
  })
  public tagFormatted: string;

  @Field()
  public expByGame: ExpByGame;

  @Field(() => [Number])
  public expHistory: number[];

  @Field(() => [String])
  public expHistoryDays: string[];

  @Field(() => [Number])
  public scaledExpHistory: number[];

  @Field()
  public weekly: number;

  @Field()
  public monthly: number;

  @Field()
  public scaledWeekly: number;

  @Field()
  public scaledMonthly: number;

  @Field({ leaderboard: false })
  public expiresAt: number;

  @Field({ store: false })
  public cached?: boolean;

  public constructor(data: APIData = {}) {
    this.id = data._id;
    this.name = data.name;
    this.nameToLower = this.name?.toLowerCase();

    this.achievements = new Achievements(data.achievements ?? {});
    this.preferredGames = data.preferredGames ?? [];
    this.publiclyListed = data.publiclyListed;

    this.exp = data.exp;

    this.tag = data.tag;
    this.tagColor = new Color(data.tagColor ?? 'GRAY');
    this.expByGame = new ExpByGame(data.guildExpByGameType ?? {});

    this.weekly = 0;
    this.scaledWeekly = 0;
    this.monthly = 0;
    this.scaledMonthly = 0;

    this.expHistory = [];
    this.expHistoryDays = [];
    this.scaledExpHistory = [];
    this.members = [];

    if (data.members) {
      for (const member of data.members) {
        this.members.push(new GuildMember(member));
      }
    }

    this.ranks = [
      new GuildRank({
        name: 'Guild Master',
        tag: data.hideGmTag ? null : 'GM',
        priority: Infinity,
        defualt: false,
      }),
    ];

    if (data.ranks) {
      for (const rank of data.ranks) {
        this.ranks.push(new GuildRank(rank));
      }
    }
  }
}
