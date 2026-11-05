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
