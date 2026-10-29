/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type APIData, findScoreIndex } from "@statsify/util";
import { Field } from "#metadata";
import { Progression } from "#progression";

const PRESTIGE_REQUIREMENTS = [
  { req: 20, tier: "I" },
  { req: 40, tier: "II" },
  { req: 60, tier: "III" },
  { req: 80, tier: "IV" },
  { req: 100, tier: "V" },
];

const EXPERIENCE_KINGS_REQUIREMENTS = [
  { req: 50_000, tier: "I" },
  { req: 100_000, tier: "II" },
  { req: 150_000, tier: "III" },
  { req: 200_000, tier: "IV" },
  { req: 250_000, tier: "V" },
  { req: 275_000, tier: "VI" },
  { req: 300_000, tier: "VII" },
];

const WINNERS_REQUIREMENTS = [
  { req: 100, tier: "I" },
  { req: 200, tier: "II" },
  { req: 300, tier: "III" },
  { req: 400, tier: "IV" },
  { req: 500, tier: "V" },
  { req: 750, tier: "VI" },
  { req: 1000, tier: "VII" },
];

const FAMILY_REQUIREMENTS = [
  { req: 5, tier: "I" },
  { req: 15, tier: "II" },
  { req: 30, tier: "III" },
  { req: 40, tier: "IV" },
  { req: 50, tier: "V" },
  { req: 60, tier: "VI" },
  { req: 70, tier: "VII" },
];

/**
 * The tier reached and the progress toward the next one. Below the first requirement the
 * tier is empty, and once every tier is reached there's no next target, so no max
 */
const getAchievementProgress = (tiers: { req: number; tier: string }[], score: number) => {
  const index = findScoreIndex(tiers, score);

  return {
    tier: tiers[index]?.tier ?? "",
    progression: new Progression(score, tiers[index + 1]?.req),
  };
};

/**
 * Better names for the guild achievements
 */
export class GuildAchievements {
  @Field()
  public familyProgression: Progression;

  @Field({ store: { default: "I" } })
  public familyTier: string;

  @Field()
  public winnersProgression: Progression;

  @Field({ store: { default: "I" } })
  public winnersTier: string;

  @Field()
  public experienceKingsProgression: Progression;

  @Field({ store: { default: "I" } })
  public experienceKingsTier: string;

  @Field()
  public prestigeProgression: Progression;

  @Field({ store: { default: "I" } })
  public prestigeTier: string;

  public constructor(level: number, data: APIData = {}) {
    const family = getAchievementProgress(FAMILY_REQUIREMENTS, data.ONLINE_PLAYERS ?? 0);
    this.familyProgression = family.progression;
    this.familyTier = family.tier;

    const winners = getAchievementProgress(WINNERS_REQUIREMENTS, data.WINNERS ?? 0);
    this.winnersProgression = winners.progression;
    this.winnersTier = winners.tier;

    const experienceKings = getAchievementProgress(
      EXPERIENCE_KINGS_REQUIREMENTS,
      data.EXPERIENCE_KINGS ?? 0
    );
    this.experienceKingsProgression = experienceKings.progression;
    this.experienceKingsTier = experienceKings.tier;

    const prestige = getAchievementProgress(PRESTIGE_REQUIREMENTS, level);
    this.prestigeProgression = prestige.progression;
    this.prestigeTier = prestige.tier;
  }
}
