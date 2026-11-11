/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { NO_STORE_EDGE } from "~/lib/cache";
import { createFileRoute } from "@tanstack/react-router";
import { discordCallbackUrl, randomToken, redirect, stateCookie } from "~/server/account.server";
import { siteConfig } from "~/server/config.server";

/** Sends the visitor to Discord to log in, with a `state` the callback checks against their cookie. */
export const Route = createFileRoute("/auth/discord/")({
  server: {
    handlers: {
      GET: async () => {
        const { discordClientId } = await siteConfig();
        if (!discordClientId) return new Response(null, { status: 404, headers: NO_STORE_EDGE });

        const state = randomToken();
        const url = new URL("https://discord.com/oauth2/authorize");

        url.search = new URLSearchParams({
          response_type: "code",
          client_id: discordClientId,
          scope: "identify",
          state,
          redirect_uri: await discordCallbackUrl(),
          // Someone who already allowed Statsify goes straight back instead of seeing the consent screen again.
          prompt: "none",
        }).toString();

        return redirect(url.href, [await stateCookie(state)]);
      },
    },
  },
});
