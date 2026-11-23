/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import * as Sentry from "@sentry/node";
import { config } from "@statsify/util";

const sentryDsn = await config("sentry.verifyServerDsn", { required: false });

// Init even without a DSN: nothing gets sent, but withIsolationScope then forks instead of sharing one scope
Sentry.init({
  dsn: sentryDsn,
  // Sentry 11 collects all of these by default
  dataCollection: { userInfo: false, cookies: false, httpBodies: [], databaseQueryData: false },
  tracePropagationTargets: [],
  normalizeDepth: 3,
  tracesSampleRate: await config("sentry.tracesSampleRate", { required: sentryDsn !== undefined }),
  environment: await config("environment"),
});
