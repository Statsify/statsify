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
  new OpenAPILink(contract, { url: rpcUrl, headers: rpcHeaders })
);
