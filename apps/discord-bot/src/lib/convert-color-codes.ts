/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

export const convertColorCodes = (content: string) =>
  content
    .replaceAll(String.raw`\&`, "󰀀")
    .replace(/&\S/g, (m) => m.replace("&", "§"))
    .replaceAll("󰀀", "&");
