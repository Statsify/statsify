/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import type * as routes from "./routes.ts";
import type { RouteHandler } from "@hono/zod-openapi";

export const get: RouteHandler<typeof routes.get> = (c) => {
  const { player: tag } = c.req.valid("query");
  return c.json({ success: true, player: { uuid: "asdasd" } });
};
