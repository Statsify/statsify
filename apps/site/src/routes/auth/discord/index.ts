/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { NO_STORE_EDGE } from "~/lib/cache";
import { clientIp } from "~/server/client-ip.server";
import { createFileRoute } from "@tanstack/react-router";
import { discordCallbackUrl, redirect, stateCookie } from "~/server/account.server";
import { rpcServerClient } from "~/server/rpc.server";
import { siteConfig } from "~/server/config.server";
import { verifyTurnstile } from "~/server/turnstile.server";

/**
 * Sends a visitor who passed Turnstile to Discord to log in, with a single-use `state` the callback checks against
 * their cookie and the API spends before asking Discord about the code.
 */
export const Route = createFileRoute("/auth/discord/")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { discordClientId } = await siteConfig();
        if (!discordClientId) return new Response(null, { status: 404, headers: NO_STORE_EDGE });

        const token = (await request.formData()).get("token");
        if (!(await verifyTurnstile(typeof token === "string" ? token : undefined, clientIp()))) {
          return redirect("/account?login=failed", []);
        }

        const { state } = await rpcServerClient.account.startLogin();
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
