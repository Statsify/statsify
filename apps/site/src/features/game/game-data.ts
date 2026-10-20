/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { orpc } from "~/lib/orpc";
import type { GamePage } from "@statsify/contract";

export type { GamePage };

/** How long a loaded game page stays fresh in the query cache; matches the page's edge TTL. */
const PAGE_STALE_MS = 60_000;

/** One mode of a player's page for a game; `mode` is left out for the game's first mode, as in the URL. */
export const gamePageQuery = (uuid: string, game: string, mode?: string) =>
  orpc.player.game.queryOptions({ input: { uuid, game, mode }, staleTime: PAGE_STALE_MS });

/** The `?mode=` of a page: none for the game's first mode. */
export const modeSearch = (page: Pick<GamePage, "modes">, mode: string): string | undefined =>
  mode === page.modes[0]?.key ? undefined : mode;
