/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { createFileRoute } from "@tanstack/react-router";
import { proxyRpc } from "~/server/rpc-proxy.server";

/** `/api/rpc/<procedure>?…`: the browser's way to the API's GET procedures, cached at the edge. */
export const Route = createFileRoute("/api/rpc/$")({
  server: {
    handlers: {
      GET: ({ request }) => {
        const url = new URL(request.url);
        return proxyRpc(url.pathname.slice("/api/rpc/".length), url.search);
      },
    },
  },
});
