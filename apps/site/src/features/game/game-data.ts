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

/**
 * One page of a player's game: a mode, or a mode's submode, in one of its periods. Each is left out when it is the
 * first, as in the URL.
 */
export const gamePageQuery = (uuid: string, game: string, mode?: string, submode?: string, period?: string) =>
  orpc.player.game.queryOptions({ input: { uuid, game, mode, submode, period }, staleTime: PAGE_STALE_MS });

/** The `?mode=` of a page: none for the game's first mode. */
export const modeSearch = (page: Pick<GamePage, "modes">, mode: string): string | undefined =>
  mode === page.modes[0]?.key ? undefined : mode;

/** The `&submode=` of a page: none for a mode's first submode, or a mode without any. */
export const submodeSearch = (page: Pick<GamePage, "submodes">, submode: string | null): string | undefined =>
  submode === null || submode === page.submodes[0]?.key ? undefined : submode;

/** The `&period=` of a page: none for its first period (all time), or a page without periods. */
export const periodSearch = (page: Pick<GamePage, "periods">, period: string | undefined): string | undefined =>
  period === undefined || period === page.periods?.[0] ? undefined : period;
