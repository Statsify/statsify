/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import * as Sentry from "@sentry/node";
import { config } from "@statsify/util";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

const sentryDsn = config("sentry.apiDsn", { required: false });

if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    integrations: [
      nodeProfilingIntegration(),
      Sentry.httpIntegration({ breadcrumbs: true }),
      Sentry.mongooseIntegration(),
      Sentry.redisIntegration({ cachePrefixes: ["zadd", "zrem"] }),
    ],
    normalizeDepth: 3,
    tracesSampleRate: config("sentry.tracesSampleRate"),
    environment: config("environment"),
  });
}
