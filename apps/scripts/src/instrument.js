/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import * as Sentry from "@sentry/node";
import { config } from "@statsify/util";

// The leaderboard cron reports to the API's project
const sentryDsn = await config("sentry.apiDsn", { required: false });

if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    // Sentry 11 collects all of these by default
    dataCollection: { userInfo: false, cookies: false, httpBodies: [], databaseQueryData: false },
    tracePropagationTargets: [],
    environment: await config("environment"),
  });
}
