/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import * as handlers from "./handlers.ts";
import * as routes from "./routes.ts";
import { OpenAPIHono } from "@hono/zod-openapi";

export const playersRouter = new OpenAPIHono()
  .openapi(routes.get, handlers.get);
