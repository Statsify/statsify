/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ValidateBy, type ValidationOptions } from "class-validator";

export const IsLeaderboardField = (fields: string[], options?: ValidationOptions) => {
  const fieldSet = new Set(fields);

  return ValidateBy(
    {
      name: "isLeaderboardField",
      validator: {
        validate: (value) => fieldSet.has(value),
        defaultMessage: (args) => {
          const value = args?.value;
          if (value === undefined) return `${args?.property} is required`;

          const values = options?.each && Array.isArray(value) ? value : [value];
          const invalid = new Set(
            values.filter((field) => !fieldSet.has(field)).map((field) => JSON.stringify(field))
          );

          return `unknown leaderboard field${invalid.size === 1 ? "" : "s"}: ${[...invalid].join(", ")}`;
        },
      },
    },
    options
  );
};
