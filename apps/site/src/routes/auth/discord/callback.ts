/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ORPCError } from "@orpc/client";
import { clearStateCookie, discordCallbackUrl, loginState, redirect, sessionCookie } from "~/server/account.server";
import { captureServerError } from "~/server/sentry.server";
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

        // Without a code, the visitor said no on Discord's screen (`error=access_denied`).
        if (!code || !state || state !== expected) return redirect("/account?login=failed", [await clearStateCookie()]);

        try {
          const { session } = await rpcServerClient.account.login({ code, redirectUri: await discordCallbackUrl() });
          return redirect("/account", [await clearStateCookie(), await sessionCookie(session)]);
        } catch (error) {
          // A refused code is the visitor's to retry; anything else (Discord or the API down) is ours to hear about.
          if (!(error instanceof ORPCError && error.defined && error.code === "UNAUTHORIZED")) captureServerError(error);
          return redirect("/account?login=failed", [await clearStateCookie()]);
        }
      },
    },
  },
});
