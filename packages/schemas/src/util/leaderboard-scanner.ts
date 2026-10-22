/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  type LeaderboardEnabledMetadata,
  type LeaderboardMetadata,
  scanMetadata,
} from "#metadata";
import { parseAdditionalFields } from "./parse-fields.js";
import type { Constructor } from "@statsify/util";

export function getLeaderboardFields<T>(constructor: Constructor<T>) {
  const metadata = scanMetadata(constructor);

  const fields = metadata.filter(([, { leaderboard }]) => leaderboard.enabled);

  return fields;
}

export function getLeaderboardField<T>(
  constructor: Constructor<T>,
  key: string,
  leaderboardMustBeEnabled?: true,
): LeaderboardEnabledMetadata;
export function getLeaderboardField<T>(
  constructor: Constructor<T>,
  key: string,
  leaderboardMustBeEnabled: false,
): LeaderboardMetadata;
export function getLeaderboardField<T>(
  constructor: Constructor<T>,
  key: string,
  leaderboardMustBeEnabled = true,
): LeaderboardMetadata {
  const metadata = scanMetadata(constructor);

  const field = metadata.find(([k]) => k === key);

  if (!field) throw new Error(`${key} is not a field for ${constructor.name}`);

  const [, { store, leaderboard }] = field;

  if (!leaderboard.enabled && leaderboardMustBeEnabled)
    throw new Error(
      `${key} is not a leaderboard field for ${constructor.name}`,
    );

  leaderboard.default = store.default;

  if (Array.isArray(leaderboard.additionalFields)) {
    leaderboard.additionalFields = leaderboard.additionalFields.map(
      parseAdditionalFields.bind(null, key),
    );
  }

  if (leaderboard.extraDisplay)
    leaderboard.extraDisplay = parseAdditionalFields(
      key,
      leaderboard.extraDisplay,
    );

  return leaderboard;
}
