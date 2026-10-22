/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { PLAYER_COOLDOWN_MS } from "#player";
import type { Player } from "@statsify/schemas";

/** When a stored player was last fetched from Hypixel, and when a refresh may fetch it again. */
export const freshness = ({ expiresAt }: Pick<Player, "expiresAt">) => ({ updatedAt: expiresAt - PLAYER_COOLDOWN_MS, expiresAt });
