import { APIData } from '@statsify/util';
import { Field } from '../decorators';
import { GuildMember } from './member';
import { getLevel, GuildRank } from './util';

export class Guild {
  @Field()
  public id: string;

  @Field()
  public name: string;

  @Field()
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

  @Field()
  public publiclyListed: boolean;

  @Field()
  public tag: string;

  @Field()
  public tagColor: string;

  @Field()
  public expByGame: object;

  public constructor(data: APIData) {
    this.id = data._id;
    this.name = data.name;
    this.nameToLower = this.name.toLowerCase();

    const levelInfo = getLevel(data.exp);

    this.level = levelInfo.level;
    this.nextLevelExp = levelInfo.nextLevelExp;

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
    this.tagColor = data.tagColor;
    this.expByGame = data.guildExpByGameType;
  }
}
