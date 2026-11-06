/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { PAGE_STALE_MS } from "~/lib/player-route";
import { orpc } from "~/lib/orpc";

export const sessionPageQuery = (uuid: string) => orpc.player.session.queryOptions({ input: { uuid }, staleTime: PAGE_STALE_MS });

/** One page of a game over a player's session; mode and submode as on the game page. */
export const sessionGameQuery = (uuid: string, game: string, mode?: string, submode?: string) =>
  orpc.player.sessionGame.queryOptions({ input: { uuid, game, mode, submode }, staleTime: PAGE_STALE_MS });
