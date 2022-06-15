import { APIData } from '@statsify/util';
import { Field } from '../../../metadata';
import { GeneralUtil } from './util';

export const GENERAL_MODES = ['overall'] as const;
export type GeneralModes = typeof GENERAL_MODES;

export class General {
  @Field()
  public achievementPoints: number;

  @Field()
  public challenges: number;

  @Field()
  public giftsSent: number;

  @Field()
  public karma: number;

  @Field({
    leaderboard: {
      fieldName: 'Network Level',
      hidden: true,
      limit: 500_000,
      additionalFields: ['stats.general.networkLevel'],
    },
  })
  public networkExp: number;

  @Field({ leaderboard: { enabled: false }, store: { default: 1 } })
  public networkLevel: number;

  @Field()
  public quests: number;

  @Field()
  public ranksGifts: number;

  public constructor(data: APIData = {}) {
    this.achievementPoints = data.achievementPoints;

    this.challenges = Math.max(
      GeneralUtil.getChallenges(data.challenges),
      data.achievements?.general_challenger ?? 0
    );
    this.karma = data.karma;

    this.networkExp = data.networkExp;

    this.networkLevel = GeneralUtil.getNetworkLevel(this.networkExp);

    this.quests = GeneralUtil.getQuests(data.quests);
  }
}
