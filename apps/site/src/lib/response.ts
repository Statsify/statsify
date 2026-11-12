/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { cacheHeaders } from "./cache";
import { createIsomorphicFn } from "@tanstack/react-start";
import { setResponseHeaders } from "@tanstack/react-start/server";

/** During SSR, lets the edge cache a 404 page briefly; a no-op in the browser. */
export const cacheNotFoundResponse = createIsomorphicFn()
  .server((edge: string) => {
    setResponseHeaders(new Headers(cacheHeaders(edge)));
  })
  .client(() => undefined);
