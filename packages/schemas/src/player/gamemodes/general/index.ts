import { APIData } from '@statsify/util';
import { Field } from '../../../decorators';
import { GeneralUtil } from './util';

export class General {
  @Field()
  public achievementPoints: number;

  @Field()
  public challenges: number;

  @Field()
  public quests: number;

  @Field()
  public networkExp: number;

  @Field({ leaderboard: false, default: 1 })
  public networkLevel: number;

  @Field()
  public karma: number;

  @Field()
  public giftsSent: number;

  @Field()
  public ranksGifts: number;

  public constructor(data: APIData = {}) {
    this.networkExp = data.networkExp;

    this.networkLevel = GeneralUtil.getNetworkLevel(this.networkExp);

    this.achievementPoints = data.achievementPoints;

    this.karma = data.karma;

    this.quests = GeneralUtil.getQuests(data.quests);

    this.challenges = Math.max(
      GeneralUtil.getChallenges(data.challenges),
      data.achievements?.general_challenger ?? 0
    );
  }
}
