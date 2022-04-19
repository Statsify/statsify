import { Field } from '../metadata';
import { ITieredAchievement, ITieredAchievementTier } from './iachievement';

class TieredAchievementTier {
  @Field()
  public tier: number;

  @Field()
  public points: number;

  @Field()
  public amount: number;

  @Field()
  public unlocked: boolean;

  public constructor(tier: ITieredAchievementTier, unlocked: boolean) {
    this.tier = tier.tier;
    this.points = tier.points;
    this.amount = tier.amount;
    this.unlocked = unlocked;
  }
}

export class TieredAchievement {
  @Field()
  public name: string;

  @Field()
  public description: string;

  @Field({ docs: { description: "The current tier's points" } })
  public points: number;

  @Field({ docs: { description: 'Total unlocked points' } })
  public unlockedPoints: number;

  @Field({ type: () => [TieredAchievementTier] })
  public tiers: TieredAchievementTier[];

  @Field()
  public legacy: boolean;

  @Field()
  public value: number;

  public constructor(ach: ITieredAchievement, value: number) {
    this.name = ach.name;
    this.value = value;
    this.legacy = ach.legacy ?? false;

    this.unlockedPoints = 0;

    let lastUnlocked = 0;

    this.tiers = ach.tiers.map((t, i) => {
      const tier = new TieredAchievementTier(t, t.amount <= value);

      if (tier.unlocked) {
        this.unlockedPoints += t.points;
        lastUnlocked = i + 1;
      }

      return tier;
    });

    const currentTier = this.tiers[Math.min(this.tiers.length - 1, lastUnlocked)];

    this.points = currentTier.points;
    this.description = ach.description.replace(/%s/g, currentTier.amount.toString());
  }
}
