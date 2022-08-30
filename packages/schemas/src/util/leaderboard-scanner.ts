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
  MetadataScanner,
} from "#metadata";

export class LeaderboardScanner {
  public static getLeaderboardMetadata<T>(constructor: Constructor<T>) {
    const metadata = MetadataScanner.scan(constructor);

    const fields = metadata.filter(([, { leaderboard }]) => leaderboard.enabled);

    return fields;
  }

  public static getLeaderboardFields<T>(constructor: Constructor<T>) {
    return this.getLeaderboardMetadata(constructor);
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

    const [, { store, leaderboard }] = field;

    if (!leaderboard.enabled && leaderboardMustBeEnabled)
      throw new Error(`${key} is not a leaderboard field for ${constructor.name}`);

    leaderboard.default = store.default;

    if (Array.isArray(leaderboard.additionalFields)) {
      leaderboard.additionalFields = leaderboard.additionalFields.map(
        this.parseAdditionalFields.bind(this, key)
      );
    }

    if (leaderboard.extraDisplay)
      leaderboard.extraDisplay = this.parseAdditionalFields(
        key,
        leaderboard.extraDisplay
      );

    return leaderboard;
  }

  private static parseAdditionalFields(field: string, additionalKey: string) {
    if (!additionalKey.startsWith("this.")) return additionalKey;

    const fieldParts = field.split(".");
    fieldParts.pop();

    const additionalFieldParts = additionalKey.split(".").slice(1);
    const ending = additionalFieldParts.pop();

    if (!additionalFieldParts.length) return [...fieldParts, ending].join(".");

    const splitIndex = fieldParts.findIndex((part) =>
      additionalFieldParts.includes(part)
    );

    if (splitIndex === -1)
      return [...fieldParts, ...additionalFieldParts, ending].join(".");

    return [...fieldParts.slice(0, splitIndex), ...additionalFieldParts, ending].join(
      "."
    );
  }
}
