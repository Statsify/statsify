/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type APIData, formatTime } from "@statsify/util";
import { Field } from "#metadata";
import { add, deepAdd, ratio } from "@statsify/math";

export class BedWarsPracticeMode {
  @Field()
  public successes: number;

  @Field()
  public fails: number;

  @Field()
  public successRatio: number;

  public constructor(data: APIData = {}) {
    this.successes = data.successful_attempts;
    this.fails = data.failed_attempts;
    BedWarsPracticeMode.applyRatios(this);
  }

  public static applyRatios(data: BedWarsPracticeMode) {
    data.successRatio = ratio(data.successes, data.fails);
  }
}

const recordOptions = {
  leaderboard: { sort: "ASC", formatter: formatTime },
  historical: { enabled: false },
} as const;

export class BedWarsPracticeBridgingRecords {
  @Field(recordOptions)
  public straightShort: number;

  @Field(recordOptions)
  public straightMedium: number;

  @Field(recordOptions)
  public straightLong: number;

  @Field(recordOptions)
  public diagonalShort: number;

  @Field(recordOptions)
  public diagonalMedium: number;

  @Field(recordOptions)
  public diagonalLong: number;

  public constructor(data: APIData = {}) {
    this.straightShort = data["bridging_distance_30:elevation_NONE:angle_STRAIGHT:"];
    this.straightMedium = data["bridging_distance_50:elevation_NONE:angle_STRAIGHT:"];
    this.straightLong = data["bridging_distance_100:elevation_NONE:angle_STRAIGHT:"];
    this.diagonalShort = data["bridging_distance_30:elevation_NONE:angle_DIAGONAL:"];
    this.diagonalMedium = data["bridging_distance_50:elevation_NONE:angle_DIAGONAL:"];
    this.diagonalLong = data["bridging_distance_100:elevation_NONE:angle_DIAGONAL:"];
  }
}

export class BedWarsPractice {
  @Field()
  public overall: BedWarsPracticeMode;

  @Field()
  public bridging: BedWarsPracticeMode;

  @Field()
  public fireballJumping: BedWarsPracticeMode;

  @Field()
  public mlg: BedWarsPracticeMode;

  @Field()
  public pearlClutching: BedWarsPracticeMode;

  @Field()
  public blocksPlaced: number;

  @Field()
  public bridgingRecords: BedWarsPracticeBridgingRecords;

  public constructor(data: APIData = {}) {
    this.bridging = new BedWarsPracticeMode(data.bridging);
    this.fireballJumping = new BedWarsPracticeMode(data.fireball_jumping);
    this.mlg = new BedWarsPracticeMode(data.mlg);
    this.pearlClutching = new BedWarsPracticeMode(data.pearl_clutching);

    this.overall = deepAdd(
      this.bridging,
      this.fireballJumping,
      this.mlg,
      this.pearlClutching,
    );

    BedWarsPracticeMode.applyRatios(this.overall);

    this.blocksPlaced = add(
      data.bridging?.blocks_placed,
      data.fireball_jumping?.blocks_placed,
      data.mlg?.blocks_placed,
    );

    this.bridgingRecords = new BedWarsPracticeBridgingRecords(data.records);
  }
}
