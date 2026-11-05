/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

const MAX_CUSTOM_ID_LENGTH = 100;

/** A custom id that keeps working after a restart, unlike a hook's */
export interface CustomId {
  route: string;
  ownerId: string;
  values: string[];
}

export function createCustomId(route: string, ownerId: string, ...values: (string | number)[]) {
  const customId = [route, ownerId, ...values].join(":");

  if (customId.length > MAX_CUSTOM_ID_LENGTH)
    throw new Error(`The custom id "${customId}" is over Discord's ${MAX_CUSTOM_ID_LENGTH} character limit`);

  return customId;
}

export function parseCustomId(customId: string): CustomId {
  const [route, ownerId, ...values] = customId.split(":");
  return { route, ownerId, values };
}

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;

  await import("reflect-metadata");
  const { METADATA_KEY, PlayerStats, getLeaderboardFields } = await import("@statsify/schemas");

  // Leaderboard buttons carry their field, so a new field that's too long would break its buttons
  it("fits the longest leaderboard field and rejects ids over 100 characters", () => {
    const fields = Object.entries(Reflect.getMetadata(METADATA_KEY, PlayerStats.prototype)).flatMap(
      ([game, { type }]) => getLeaderboardFields(type.type).map(([key]) => `${game}.${key}`)
    );

    const longest = fields.reduce((longest, field) => (field.length > longest.length ? field : longest));
    const ownerId = "1".repeat(20);

    expect(parseCustomId(createCustomId("lb", ownerId, "position", longest))).toEqual({
      route: "lb",
      ownerId,
      values: ["position", longest],
    });

    expect(() => createCustomId("lb", ownerId, "x".repeat(80))).toThrow();
  });
}
