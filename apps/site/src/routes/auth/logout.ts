/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { captureServerError } from "~/server/sentry.server";
import { clearSessionCookie, redirect, sessionToken } from "~/server/account.server";
import { createFileRoute } from "@tanstack/react-router";
import { rpcServerClient } from "~/server/rpc.server";

export const Route = createFileRoute("/auth/logout")({
  server: {
    handlers: {
      POST: async () => {
        const session = sessionToken();
        // The cookie goes either way; a session the API couldn't end runs out on its own TTL.
        if (session) await rpcServerClient.account.logout({ session }).catch(captureServerError);
        return redirect("/account", [await clearSessionCookie()]);
      },
    },
  },
});
