/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { API } from "@discordjs/core/http-only";
import { Agent } from "undici";
import { REST, type RESTOptions } from "@discordjs/rest";

export function createDiscordApi(
  token: string,
  options: Pick<Partial<RESTOptions>, "timeout"> = {},
) {
  const rest = new REST({
    ...options,
    // Below Discord's idle close, since a request sent on a socket it closed isn't retried
    agent: new Agent({ keepAliveTimeout: 30_000 }),
  });

  return new API(rest.setToken(token));
}
