/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ORPCError } from "@orpc/client";
import { clearStateCookie, discordCallbackUrl, loginState, redirect, sessionCookie, sessionToken } from "~/server/account.server";
import { captureServerError } from "~/server/sentry.server";
import { clientIp } from "~/server/client-ip.server";
import { createFileRoute } from "@tanstack/react-router";
import { rpcServerClient } from "~/server/rpc.server";

/**
 * Discord's redirect back. The `state` has to match the visitor's cookie, so nobody can log a visitor into another
 * account with a code of their own.
 */
export const Route = createFileRoute("/auth/discord/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const search = new URL(request.url).searchParams;
        const code = search.get("code");
        const state = search.get("state");
        const expected = loginState();

        if (!code || !state || state !== expected) return redirect("/account?login=failed", [await clearStateCookie()]);

        try {
          const redirectUri = await discordCallbackUrl();
          const { session } = await rpcServerClient.account.login({ code, redirectUri, clientIp: clientIp() });

          const previous = sessionToken();
          if (previous) await rpcServerClient.account.logout({ session: previous }).catch(captureServerError);

          return redirect("/account", [await clearStateCookie(), await sessionCookie(session)]);
        } catch (error) {
          // A refused code or too many tries is the visitor's to retry; anything else (Discord or the API down) is ours.
          if (!(error instanceof ORPCError && error.defined)) captureServerError(error);
          return redirect("/account?login=failed", [await clearStateCookie()]);
        }
      },
    },
  },
});
