/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { definePlugin } from "nitro";
import { siteConfig } from "./config.server";

/** A setting the site can't run with stops it at startup, rather than failing its first requests. */
export default definePlugin(() => {
  siteConfig().catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
});
