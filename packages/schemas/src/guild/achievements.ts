/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { APIData, findScore } from "@statsify/util";
import { Field } from "../metadata";
import { Progression } from "../progression";

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

  public constructor(data: APIData, level: number) {
    const familyScore = data.ONLINE_PLAYERS;
    const winnersScore = data.WINNERS;
    const expierienceKingsScore = data.EXPERIENCE_KINGS;
    const prestigeScore = level;

    const familyLevel = findScore(FAMILY_REQUIREMENTS, familyScore);
    this.familyProgression = new Progression(familyScore, familyLevel.req);
    this.familyTier = familyLevel.tier;

    const winnersLevel = findScore(WINNERS_REQUIREMENTS, winnersScore);
    this.winnersProgression = new Progression(winnersScore, winnersLevel.req);
    this.winnersTier = winnersLevel.tier;

    const experienceKingsLevel = findScore(
      EXPERIENCE_KINGS_REQUIREMENTS,
      expierienceKingsScore
    );

    this.experienceKingsProgression = new Progression(
      expierienceKingsScore,
      experienceKingsLevel.req
    );

    this.experienceKingsTier = experienceKingsLevel.tier;

    const prestigeLevel = findScore(PRESTIGE_REQUIREMENTS, prestigeScore);
    this.prestigeProgression = new Progression(prestigeScore, prestigeLevel.req);
    this.prestigeTier = prestigeLevel.tier;
  }
}
