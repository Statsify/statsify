/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { resolvePlayer } from "~/features/player/resolve";
import { rpc } from "~/lib/orpc";
import type { BingoPlayer } from "@statsify/contract";

/**
 * The boards for a URL name or UUID through the contract, strict cache-only: a page view never
 * calls Hypixel, and `refreshBingo` is the only way to fetch the player again. `null` when the API has
 * never seen the name.
 */
export async function loadBingoPlayer(name: string): Promise<BingoPlayer | null> {
  const identity = await resolvePlayer(name);
  return identity && (await rpc.player.bingo({ uuid: identity.uuid }));
}
