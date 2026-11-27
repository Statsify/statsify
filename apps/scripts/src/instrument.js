/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import * as Sentry from "@sentry/node";
import { sentryOptions } from "@statsify/logger/sentry";

// Init even without a DSN: nothing gets sent, but withIsolationScope then forks instead of sharing one scope
Sentry.init({
  ...(await sentryOptions("sentry.apiDsn", { tracing: false })),
  tracePropagationTargets: [],
});
