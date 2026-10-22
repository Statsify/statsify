/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ValidateBy } from "class-validator";

export const IsLeaderboardField = (fields: string[]) => {
  const fieldSet = new Set(fields);

  return ValidateBy({
    name: "isLeaderboardField",
    validator: {
      validate: (value) => Array.isArray(value) && value.every((field) => fieldSet.has(field)),
      defaultMessage: (args) => {
        const value: unknown = args?.value;
        if (!Array.isArray(value)) return `${args?.property} must be an array of leaderboard fields`;

        // Quoted so an empty string or a stray space still shows
        const invalid = new Set(
          value.filter((field) => !fieldSet.has(field)).map((field) => JSON.stringify(field))
        );

        return `unknown leaderboard field${invalid.size === 1 ? "" : "s"}: ${[...invalid].join(", ")}`;
      },
    },
  });
};

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;
  const { validate } = await import("class-validator");

  class Dto {
    @IsLeaderboardField(["wins", "kills"])
    public fields: unknown;
  }

  const messages = async (fields: unknown) => {
    const errors = await validate(Object.assign(new Dto(), { fields }));
    return errors.flatMap((error) => Object.values(error.constraints ?? {}));
  };

  it("names the values that aren't leaderboard fields", async () => {
    await expect(messages(["wins", "kills"])).resolves.toEqual([]);
    await expect(messages(["wins", "nope"])).resolves.toEqual(['unknown leaderboard field: "nope"']);
    await expect(messages(["nope", 5, "nope", ""])).resolves.toEqual([
      'unknown leaderboard fields: "nope", 5, ""',
    ]);
    await expect(messages("wins")).resolves.toEqual([
      "fields must be an array of leaderboard fields",
    ]);
  });
}
