/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { PAGE_STALE_MS } from "~/lib/player-route";
import { orpc } from "~/lib/orpc";

export const guildPageQuery = (name: string) => orpc.guild.page.queryOptions({ input: { name }, staleTime: PAGE_STALE_MS });
