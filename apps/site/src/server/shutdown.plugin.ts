/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { definePlugin } from "nitro";
import { shutdown } from "./shutdown.server";

/**
 * On SIGINT (what pm2 sends) or SIGTERM, Nitro's server stops listening and waits for open connections to end.
 * A keep-alive connection that is serving a request at that moment would stay open after the response (nginx keeps
 * its upstream connections for a minute) until Nitro's graceful window runs out, so from the signal on every
 * response says `Connection: close`. Once the last one is done, the `close` hook closes the app's own resources
 * (see `shutdown.server.ts`) and the process exits.
 */
export default definePlugin((nitroApp) => {
  let draining = false;
  for (const signal of ["SIGINT", "SIGTERM"] as const) {
    process.on(signal, () => {
      draining = true;
    });
  }

  nitroApp.hooks.hook("response", (response) => {
    if (!draining) return;
    try {
      response.headers.set("Connection", "close");
    } catch {
      // A response passed straight through from `fetch` has immutable headers; its connection ends with the window.
    }
  });

  nitroApp.hooks.hook("close", shutdown);
});
