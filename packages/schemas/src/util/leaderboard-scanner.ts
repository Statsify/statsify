/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Constructor } from "@statsify/util";
import {
  LeaderboardEnabledMetadata,
  LeaderboardMetadata,
} from "../metadata/metadata.interface";
import { MetadataScanner } from "../metadata";

export class LeaderboardScanner {
  public static getLeaderboardMetadata<T>(constructor: Constructor<T>) {
    const metadata = MetadataScanner.scan(constructor);

    const fields = metadata.filter(([, { leaderboard }]) => leaderboard.enabled);

    return fields;
  }

  public static getLeaderboardFields<T>(constructor: Constructor<T>): string[] {
    return this.getLeaderboardMetadata(constructor).map(([key]) => key);
  }

  public static getLeaderboardField<T>(
    constructor: Constructor<T>,
    key: string,
    leaderboardMustBeEnabled?: true
  ): LeaderboardEnabledMetadata;
  public static getLeaderboardField<T>(
    constructor: Constructor<T>,
    key: string,
    leaderboardMustBeEnabled: false
  ): LeaderboardMetadata;
  public static getLeaderboardField<T>(
    constructor: Constructor<T>,
    key: string,
    leaderboardMustBeEnabled = true
  ): LeaderboardMetadata {
    const metadata = MetadataScanner.scan(constructor);

    const field = metadata.find(([k]) => k === key);

    if (!field) throw new Error(`${key} is not a field for ${constructor.name}`);

    const [, { leaderboard }] = field;

    if (!leaderboard.enabled && leaderboardMustBeEnabled)
      throw new Error(`${key} is not a leaderboard field for ${constructor.name}`);

    return leaderboard;
  }
}
