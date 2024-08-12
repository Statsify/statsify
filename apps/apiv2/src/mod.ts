/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import * as Sentry from "@sentry/node";
import { config } from "@statsify/util";
import { createContext } from "#trpc";
import { createHTTPServer } from "@trpc/server/adapters/standalone";
import { guildsRouter } from "#routers/guilds";
import { playersRouter } from "#routers/players";
import { router } from "#routing";
import { sessionsRouter } from "#routers/sessions";
import { skinsRouter } from "#routers/skins";
import { usersRouter } from "#routers/users";

const sentryDsn = config("sentry.apiDsn", { required: false });

if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    integrations: [
      Sentry.httpIntegration({ breadcrumbs: true }),
      Sentry.mongooseIntegration(),
      Sentry.redisIntegration(),
    ],
    normalizeDepth: 3,
    tracesSampleRate: config("sentry.tracesSampleRate"),
    environment: config("environment"),
  });
}

export const app = router({
  guilds: guildsRouter,
  players: playersRouter,
  sessions: sessionsRouter,
  skins: skinsRouter,
  users: usersRouter,
});

export type App = typeof app;

const server = createHTTPServer({ router: app, createContext });
server.listen(3000);

