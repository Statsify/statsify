/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Hono } from "hono";
import { apiReference } from "@scalar/hono-api-reference";
import { commandsRouter } from "./routes/commands.ts";
import { playersRouter } from "./routes/players.ts";
import { serve } from "@hono/node-server";
import { showRoutes } from "hono/dev";
import { skinsRouter } from "./routes/skins.ts";
import { usersRouter } from "./routes/users.ts";
import "./db/mongo.ts";

const app = new Hono()
  .route("/users", usersRouter)
  .route("/players", playersRouter)
  .route("/skins", skinsRouter)
  .route("/commands", commandsRouter)
  .get("/", apiReference({ theme: "saturn", url: "/openapi" }));

// app.get(
//   "/openapi",
//   openAPISpecs(app, {
//     documentation: {
//       info: {
//         title: "Statsify API",
//         version: "1.0.0",
//       },
//       servers: [
//         { url: "https://api.statsify.net", description: "Production Server" },
//         { url: "http://localhost:3000", description: "Local Server" },
//       ],
//     },
//   })
// );

serve({
  fetch: app.fetch,
  port: 3000,
}, (info) => {
  showRoutes(app, { colorize: true });
  console.log(`Server is running on http://localhost:${info.port}`);
});

