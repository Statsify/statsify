/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { createContext } from "./trpc.js";
import { createHTTPServer } from "@trpc/server/adapters/standalone";
import { guildsRouter } from "./routers/guilds.js";
import { playersRouter } from "./routers/players.js";
import { router } from "./routing.js";
import { sessionsRouter } from "./routers/sessions.js";
import { skinsRouter } from "./routers/skins.js";
import { usersRouter } from "./routers/users.js";

const app = router({
  guilds: guildsRouter,
  players: playersRouter,
  sessions: sessionsRouter,
  skins: skinsRouter,
  users: usersRouter,
});

export type App = typeof app;

const server = createHTTPServer({ router: app, createContext });
server.listen(3000);

