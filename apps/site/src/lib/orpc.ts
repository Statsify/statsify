/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { OpenAPILink } from "@orpc/openapi-client/fetch";
import minifiedContract from "@statsify/contract/minified";
import type { SiteClient } from "@statsify/contract";
import { createIsomorphicFn } from "@tanstack/react-start";
import { createORPCClient } from "@orpc/client";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { rpcServerClient } from "~/server/rpc.server";

const getClient = createIsomorphicFn()
  .server(() => rpcServerClient)
  .client(
    // The schema-free contract: the link only needs routes, and the browser bundle skips every zod schema.
    (): SiteClient =>
      createORPCClient(
        new OpenAPILink(minifiedContract, { url: `${window.location.origin}/api/rpc` })
      )
  );

/** Procedure clients: straight to the API on the server, through the edge-cached proxy in the browser. */
export const rpc = getClient();

/** TanStack Query helpers, e.g. `orpc.search.suggest.queryOptions({ input })`. */
export const orpc = createTanstackQueryUtils(rpc);
