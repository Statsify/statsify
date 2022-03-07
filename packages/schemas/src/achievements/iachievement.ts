export interface IAchievement {
  name: string;
  description: string;
  legacy?: boolean;
}

export interface IOneTimeAchievement extends IAchievement {
  points: number;
  gamePercentUnlocked: number;
  globalPercentUnlocked: number;
}

export interface ITieredAchievementTier {
  tier: number;
  points: number;
  amount: number;
}

export interface ITieredAchievement extends IAchievement {
  tiers: ITieredAchievementTier[];
}
