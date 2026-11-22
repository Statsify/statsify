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
 * After the signal, Nitro waits for open connections to end, and a keep-alive one would hold out until its graceful
 * window runs out, so every response from then on says `Connection: close`.
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
