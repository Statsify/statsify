/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { definePlugin } from "nitro";
import { siteConfig } from "./config.server";

/** A Nitro hook rather than the app's request middleware: the files in `public/` are served before the app. */
export default definePlugin((nitroApp) => {
  nitroApp.hooks.hook("response", async (response) => {
    if (!(await siteConfig()).indexable) response.headers.set("X-Robots-Tag", "noindex");
  });
});
