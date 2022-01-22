import { APIData } from '@statsify/util';
import { Color } from '../color';
import { Field } from '../decorators';
import { ExpByGame } from './expbygame';
import { GuildMember } from './member';
import { GuildRank } from './rank';
import { getLevel } from './util';

export class Guild {
  @Field({ index: true })
  public id: string;

  @Field()
  public name: string;

  @Field({ index: true })
  public nameToLower: string;

  @Field()
  public exp: number;

  @Field({ getter: (target: Guild) => getLevel(target.exp).level })
  public level: number;

  @Field({ getter: (target: Guild) => getLevel(target.exp).nextLevelExp })
  public nextLevelExp: number;

  @Field()
  public members: GuildMember[];

  @Field()
  public ranks: GuildRank[];

  @Field()
  public achievements: object;

  @Field()
  public preferredGames: string[];

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

  public constructor(data: APIData) {
    this.id = data._id;
    this.name = data.name;
    this.nameToLower = this.name.toLowerCase();

    this.members = [];

    for (const member of data.members) {
      this.members.push(new GuildMember(member));
    }

    this.ranks = [
      new GuildRank({
        name: 'Guild Master',
        tag: data.hideGmTag ? null : 'GM',
        priority: Infinity,
        defualt: false,
      }),
    ];

    for (const rank of data.ranks) {
      this.ranks.push(new GuildRank(rank));
    }

    this.achievements = data.achievements;
    this.preferredGames = data.preferredGames;
    this.publiclyListed = data.publiclyListed;
    this.tag = data.tag;
    this.tagColor = new Color(data.tagColor ?? 'GRAY');
    this.expByGame = new ExpByGame(data.guildExpByGameType ?? {});
  }
}
