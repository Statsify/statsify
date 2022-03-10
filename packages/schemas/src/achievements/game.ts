import { APIData } from '@statsify/util';
import { Field } from '../decorators';
import { IOneTimeAchievement, ITieredAchievement } from './iachievement';
import { OneTimeAchievement } from './one-time-achievement';
import { TieredAchievement } from './tiered-achievement';

export class AchievementsGame {
  @Field({ type: () => [OneTimeAchievement] })
  public oneTime: OneTimeAchievement[];

  @Field({ type: () => [TieredAchievement] })
  public tiered: TieredAchievement[];

  @Field()
  public points: number;

  @Field()
  public totalPoints: number;

  @Field()
  public totalLegacyPoints: number;

  public constructor(
    data: APIData,
    gameName: string,
    oneTime: string[],
    tiered: Record<string, number>
  ) {
    data = data[gameName] ?? {};

    this.points = 0;

    this.oneTime = Object.entries((data.one_time as Record<string, IOneTimeAchievement>) ?? {}).map(
      ([key, ach]) => {
        const unlocked = oneTime.includes(`${gameName}_${key}`.toLowerCase());
        const achievement = new OneTimeAchievement(ach, unlocked);

        if (achievement.unlocked && !achievement.legacy) this.points += ach.points;

        return achievement;
      }
    );

    this.tiered = Object.entries((data.tiered as Record<string, ITieredAchievement>) ?? {}).map(
      ([key, ach]) => {
        const value = tiered[`${gameName}_${key}`.toLowerCase()] ?? 0;
        const achievement = new TieredAchievement(ach, value);

        if (!achievement.legacy) this.points += achievement.unlockedPoints;

        return achievement;
      }
    );

    this.totalPoints = data.total_points;
    this.totalLegacyPoints = data.total_legacy_points;
  }
}
