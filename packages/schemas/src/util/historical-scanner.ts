/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Constructor } from "@statsify/util";
import {
  HistoricalEnabledMetadata,
  HistoricalMetadata,
} from "../metadata/metadata.interface";
import { MetadataEntry, MetadataScanner } from "../metadata";
import { parseAdditionalFields } from "./parse-fields";

export class HistoricalScanner {
  public static getHistoricalMetadata<T>(constructor: Constructor<T>) {
    const metadata = MetadataScanner.scan(constructor);

    const fields = metadata.filter(([, { historical }]) => historical.enabled);

    return fields;
  }

  public static getHistoricalFields<T>(constructor: Constructor<T>) {
    return this.getHistoricalMetadata(constructor);
  }

  public static getHistoricalField<T>(
    constructor: Constructor<T>,
    key: string,
    leaderboardMustBeEnabled?: true
  ): HistoricalEnabledMetadata;
  public static getHistoricalField<T>(
    constructor: Constructor<T>,
    key: string,
    leaderboardMustBeEnabled: false
  ): HistoricalMetadata;
  public static getHistoricalField<T>(
    constructor: Constructor<T>,
    key: string,
    leaderboardMustBeEnabled = true
  ): HistoricalMetadata {
    const field: MetadataEntry | undefined = MetadataScanner.scan(constructor).find(
      ([k]) => k === key
    );
    if (!field) throw new Error(`${key} is not a field for ${constructor.name}`);

    const [, { historical }] = field;

    if (!historical.enabled && leaderboardMustBeEnabled)
      throw new Error(
        `${key} is not a historical leaderboard field for ${constructor.name}`
      );

    if (Array.isArray(historical.additionalFields)) {
      historical.additionalFields = historical.additionalFields.map(
        parseAdditionalFields.bind(this, key)
      );
    }

    return historical;
  }
}
