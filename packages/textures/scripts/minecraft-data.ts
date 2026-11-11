/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

const MINECRAFT_DATA = "https://raw.githubusercontent.com/PrismarineJS/minecraft-data/3.117.0/data/pc";

export const fetchJson = async <T>(path: string): Promise<T> => {
  const response = await fetch(`${MINECRAFT_DATA}/${path}`);
  if (!response.ok) throw new Error(`${path}: ${response.status}`);
  return response.json() as Promise<T>;
};
