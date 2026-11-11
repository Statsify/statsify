/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { clearSessionCookie, redirect, sessionToken } from "~/server/account.server";
import { createFileRoute } from "@tanstack/react-router";
import { rpcServerClient } from "~/server/rpc.server";

/** The account page's Log out form: ends the session in the API, clears the cookie and goes back to the page. */
export const Route = createFileRoute("/auth/logout")({
  server: {
    handlers: {
      POST: async () => {
        const session = sessionToken();
        if (session) await rpcServerClient.account.logout({ session });
        return redirect("/account", [await clearSessionCookie()]);
      },
    },
  },
});
