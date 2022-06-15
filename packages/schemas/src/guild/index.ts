import { APIData } from '@statsify/util';
import { Color } from '../color';
import { GameCode } from '../game';
import { Field } from '../metadata';
import { GuildAchievements } from './achievements';
import { ExpByGame } from './expbygame';
import { GuildMember } from './member';
import { GuildRank } from './rank';
import { getLevel } from './util';

export class Guild {
  @Field({ mongo: { index: true, unique: true }, store: { required: true } })
  public id: string;

  @Field()
  public name: string;

  @Field({ mongo: { index: true, lowercase: true }, store: { required: true } })
  public nameToLower: string;

  @Field()
  public nameFormatted: string;

  @Field({ store: { required: false } })
  public description?: string;

  @Field({ leaderboard: { enabled: false } })
  public createdAt: number;

  @Field()
  public exp: number;

  @Field({ leaderboard: { enabled: false } })
  public level: number;

  @Field({ leaderboard: { enabled: false } })
  public nextLevelExp: number;

  @Field({ type: () => [GuildMember] })
  public members: GuildMember[];

  @Field({ type: () => [GuildRank] })
  public ranks: GuildRank[];

  @Field()
  public achievements: GuildAchievements;

  @Field({ type: () => [String] })
  public preferredGames: GameCode[];

  @Field({ store: { default: true } })
  public publiclyListed: boolean;

  @Field()
  public tag: string;

  @Field()
  public tagColor: Color;

  @Field()
  public tagFormatted: string;

  @Field()
  public expByGame: ExpByGame;

  @Field({ type: () => [Number] })
  public expHistory: number[];

  @Field({ type: () => [String] })
  public expHistoryDays: string[];

  @Field({ type: () => [Number] })
  public scaledExpHistory: number[];

  @Field()
  public daily: number;

  @Field()
  public weekly: number;

  @Field()
  public monthly: number;

  @Field()
  public questParticipation: number;

  @Field({ leaderboard: { enabled: false } })
  public expiresAt: number;

  @Field({ store: { store: false } })
  public cached?: boolean;

  public constructor(data: APIData = {}) {
    this.id = data._id;
    this.name = data.name;
    this.nameToLower = this.name?.toLowerCase();
    this.description = data.description;

    this.createdAt = data.created;

    this.tag = data.tag;
    this.tagColor = new Color(data.tagColor ?? 'GRAY');
    this.tagFormatted = this.tag ? `${this.tagColor}[${this.tag}${this.tagColor}]` : '';

    this.nameFormatted = `${this.tagColor}${this.name}${
      this.tagFormatted ? ` ${this.tagFormatted}` : ''
    }`;

    this.achievements = new GuildAchievements(data.achievements ?? {});
    this.preferredGames = data.preferredGames ?? [];
    this.publiclyListed = data.publiclyListed;

    this.exp = data.exp;

    const { level, nextLevelExp } = getLevel(this.exp);

    this.level = level;
    this.nextLevelExp = nextLevelExp;
    this.expByGame = new ExpByGame(data.guildExpByGameType ?? {});

    this.daily = 0;
    this.weekly = 0;
    this.monthly = 0;

    this.questParticipation = 0;

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

    this.ranks = this.ranks.sort((a, b) => b.priority - a.priority);
  }
}

export * from './achievements';
export * from './member';
