/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import * as Sentry from "@sentry/nestjs";
import { sentryOptions } from "@statsify/logger/sentry";

const options = await sentryOptions("sentry.apiDsn");

// Init even without a DSN: nothing gets sent, but withIsolationScope then forks instead of sharing one scope
Sentry.init({
  ...options,
  // Redis spans every command, so a player save would get one span per leaderboard
  integrations: (integrations) =>
    integrations.filter((integration) => integration.name !== "Redis"),
  // userInfo doesn't cover the client IP headers
  dataCollection: {
    ...options.dataCollection,
    httpHeaders: { request: { deny: ["ip", "forwarded"] } },
  },
  tracePropagationTargets: [],
  strictTraceContinuation: true,
});
