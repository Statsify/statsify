/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { NO_STORE, RETRY_AFTER_SECONDS } from "~/lib/cache";
import { OpenAPILink } from "@orpc/openapi-client/fetch";
import { type SiteClient, contract } from "@statsify/contract";
import { createORPCClient } from "@orpc/client";
import { siteConfig } from "./config.server";

export async function rpcUrl() {
  const { apiRoute } = await siteConfig();
  return `${apiRoute.replace(/\/$/, "")}/rpc`;
}

async function rpcHeaders() {
  const { apiKey } = await siteConfig();
  return { "x-api-key": apiKey };
}

/**
 * A GET to the API with the site's key, for the proxies. `null` when the API refused (429), failed (5xx) or didn't
 * answer, which they pass on as `unavailable()`.
 */
export async function fetchApi(url: string | URL): Promise<Response | null> {
  const upstream = await fetch(url, { headers: await rpcHeaders() }).catch(() => null);
  if (upstream && upstream.status !== 429 && upstream.status < 500) return upstream;
  await upstream?.body?.cancel();
  return null;
}

/** A 503 that's never cached and has the browser back off. */
export function unavailable(body?: Record<string, unknown>): Response {
  const init = { status: 503, headers: { ...NO_STORE, "Retry-After": String(RETRY_AFTER_SECONDS) } };
  return body ? Response.json(body, init) : new Response(null, init);
}

/**
 * The server-only oRPC client: straight to the API's `/rpc` with the site's own key. Loaders use
 * it during SSR and server functions use it for refresh and lookup; browsers go through `/api/rpc/$`.
 */
export const rpcServerClient: SiteClient = createORPCClient(
  new OpenAPILink(contract, { url: rpcUrl, headers: rpcHeaders })
);
