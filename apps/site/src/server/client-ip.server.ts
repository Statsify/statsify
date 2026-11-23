/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { getRequest, getRequestIP } from "@tanstack/react-start/server";

/** The visitor's address: nginx passes Cloudflare's `CF-Connecting-IP` through. */
export function clientIp(): string {
  return getRequest().headers.get("cf-connecting-ip") ?? getRequestIP() ?? "unknown";
}
