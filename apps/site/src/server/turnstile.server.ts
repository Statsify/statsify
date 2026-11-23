/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { siteConfig } from "./config.server";

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/**
 * Checks a Turnstile token with Cloudflare. The check fails closed: without
 * `site.turnstile.secretKey` in `config.js` no lookup goes through, except in development
 * (`environment: "dev"`), where no widget is rendered. The per-address and global budgets still apply.
 *
 * A token is only good on the site it was solved on: the hostname Cloudflare reports has to be `site.publicUrl`'s.
 * Development skips that, since Cloudflare's test keys report `localhost` wherever they run.
 */
export async function verifyTurnstile(token: string | undefined, clientIp: string): Promise<boolean> {
  const { turnstileSecretKey, environment, publicUrl } = await siteConfig();

  if (!turnstileSecretKey) {
    if (environment === "dev") return true;
    console.error("site.turnstile.secretKey is missing from config.js; refusing the Hypixel lookup");
    return false;
  }

  if (!token) return false;

  const body = new URLSearchParams({ secret: turnstileSecretKey, response: token });
  if (clientIp !== "unknown") body.set("remoteip", clientIp);

  // A hung siteverify call would hold the lookup open; treat it as a failed check.
  const response = await fetch(VERIFY_URL, { method: "POST", body, signal: AbortSignal.timeout(5000) }).catch(() => null);
  if (!response) return false;
  if (!response.ok) return false;

  const result = (await response.json()) as { success?: boolean; hostname?: string };
  if (result.success !== true) return false;
  return environment === "dev" || result.hostname === new URL(publicUrl).hostname;
}
