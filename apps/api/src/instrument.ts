/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import * as Sentry from "@sentry/nestjs";
import { config } from "@statsify/util";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

const sentryDsn = await config("sentry.apiDsn", { required: false });

// Init even without a DSN: nothing gets sent, but withIsolationScope then forks instead of sharing one scope
Sentry.init({
  dsn: sentryDsn,
  // Redis spans every command, so a player save would get one span per leaderboard
  integrations: (integrations) => [
    ...integrations.filter((integration) => integration.name !== "Redis"),
    nodeProfilingIntegration(),
  ],
  // Only sampled traces get profiled, so tracesSampleRate still sets the volume
  profileLifecycle: "trace",
  profileSessionSampleRate: 1,
  // Sentry 11 collects all of these by default, and userInfo doesn't cover the client IP headers
  dataCollection: {
    userInfo: false,
    cookies: false,
    httpBodies: [],
    databaseQueryData: false,
    httpHeaders: { request: { deny: ["ip", "forwarded"] } },
  },
  normalizeDepth: 3,
  tracesSampleRate: await config("sentry.tracesSampleRate", { required: sentryDsn !== undefined }),
  environment: await config("environment"),
});
