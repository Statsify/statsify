/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Hono } from "hono";
import { playersRouter } from "./routes/players.js";
import { serve } from "@hono/node-server";
import { showRoutes } from "hono/dev";
import { usersRouter } from "./routes/users.js";
import "./db.js";

const app = new Hono()
  .route("/users", usersRouter)
  .route("/players", playersRouter)
  .get("/", (c) => c.text("Hello Hono!"));

serve({
  fetch: app.fetch,
  port: 3000,
}, (info) => {
  showRoutes(app, { colorize: true });
  console.log(`Server is running on http://localhost:${info.port}`);
});
