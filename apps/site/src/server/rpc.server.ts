/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { OpenAPILink } from "@orpc/openapi-client/fetch";
import { type SiteClient, contract } from "@statsify/contract";
import { createORPCClient } from "@orpc/client";
import { siteConfig } from "./config.server";

/** How long any call to the API may take. Past it the API counts as down, so a stalled one can't hang the page. */
export const API_TIMEOUT_MS = 10_000;

export async function rpcUrl() {
  const { apiRoute } = await siteConfig();
  return `${apiRoute.replace(/\/$/, "")}/rpc`;
}

export async function rpcHeaders() {
  const { apiKey } = await siteConfig();
  return { "x-api-key": apiKey };
}

/**
 * The server-only oRPC client: straight to the API's `/rpc` with the site's own key. Loaders use
 * it during SSR and server functions use it for refresh and lookup; browsers go through `/api/rpc/$`.
 */
export const rpcServerClient: SiteClient = createORPCClient(
  new OpenAPILink(contract, {
    url: rpcUrl,
    headers: rpcHeaders,
    fetch: (request, init) => fetch(request, { ...init, signal: AbortSignal.any([request.signal, AbortSignal.timeout(API_TIMEOUT_MS)]) }),
  })
);
