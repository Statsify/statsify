/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

/** The logo's icon link. The 16 and 32 px icons in favicon.ico are drawn for their size; a scaled-down 64 px logo would blur. */
export const LOGO_ICON = { rel: "icon", href: "/favicon.ico", sizes: "16x16 32x32 48x48 64x64 128x128 256x256" };

/** A player page's tab icon, from its loader's data: the player's face at 32 px, since browsers smooth a scaled favicon. */
export const playerTabIcon = (loaderData: unknown) => {
  const uuid = (loaderData as { uuid?: string } | undefined)?.uuid;
  return uuid ? `/api/skin/head?uuid=${uuid}&size=32` : undefined;
};
