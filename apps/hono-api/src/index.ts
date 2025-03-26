/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import "zod-openapi/extend";

import { Hono } from "hono";
import { apiReference } from "@scalar/hono-api-reference";
import { commandsRouter } from "./routes/commands.ts";
import { createOpenApiDocs } from "./middleware/openapi.ts";
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
  .get("/", apiReference({ theme: "deepSpace", url: "/openapi" }));

export type AppType = typeof app;

const openapiDocs = createOpenApiDocs(app, {
  info: {
    version: "1.0.0",
    title: "Statsify API",
    description: "The Statsify API powers the Statsify discord bot (https://statsify.net)",
    license: { name: "GPL-3.0" },
  },
  servers: [
    { description: "Production", url: "https://api.statsify.net" },
    { description: "Local", url: "http://localhost:3000" },
  ],
});

app.get("/openapi", (c) => c.json(openapiDocs));

serve({
  fetch: app.fetch,
  port: 3000,
}, (info) => {
  showRoutes(app, { colorize: true });
  console.log(`Server is running on http://localhost:${info.port}`);
});

