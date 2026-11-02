/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import type { AbstractCommandListener, ComponentRoute } from "@statsify/discord";

/** Buttons on /guild re-run the subcommand for the same guild: `g:<user id>:<subcommand>:<guild id>:...` */
export const GUILD_ROUTE = "g";

export function guildRoute(listener: AbstractCommandListener): ComponentRoute {
  return (interaction, { ownerId, values: [subcommand, guildId] }) =>
    listener.rerunCommand(interaction, ownerId, ["guild", subcommand], { query: guildId });
}
