/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { definePlugin } from "nitro";
import { siteConfig } from "./config.server";

/**
 * `site.indexable` off (a staging deploy): every response carries `X-Robots-Tag: noindex`. A Nitro hook rather than
 * the app's request middleware, because the files in `public/` (images, fonts, backgrounds, icons) are served before
 * the app and never reach it.
 */
export default definePlugin((nitroApp) => {
  nitroApp.hooks.hook("response", async (response) => {
    if (!(await siteConfig()).indexable) response.headers.set("X-Robots-Tag", "noindex");
  });
});
