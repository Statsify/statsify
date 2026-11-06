/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { rpc } from "~/lib/orpc";
import type { HomePreviews } from "@statsify/contract";

export type HomeData = HomePreviews & {
  /** The API didn't answer, so every preview is missing and the page mustn't be cached. */
  unavailable?: true;
};

/** Every preview missing: the home page still renders, without them. */
const NO_PREVIEWS: HomeData = {
  players: { bedwars: null, skywars: null, duels: null, arcade: null, session: null },
  guild: null,
  leaderboard: null,
  unavailable: true,
};

/**
 * The home page's previews through the contract: strict cache-only, trimmed view models rather
 * than whole player documents. Each preview is `null` when its data is missing, and its section hides.
 */
export const getHomeData = (): Promise<HomeData> => rpc.home.previews().catch(() => NO_PREVIEWS);
