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

const sentryDsn = await config("sentry.discordBotDsn", { required: false });

// Discord's callback and webhook paths carry the interaction token, which can reply as the bot
const INTERACTION_TOKEN = /(?<=\/(?:interactions|webhooks)\/\d+\/)[^/?]+/;

if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    integrations: [nodeProfilingIntegration()],
    // Only sampled traces get profiled, so tracesSampleRate still sets the volume
    profileLifecycle: "trace",
    profileSessionSampleRate: 1,
    // Sentry 11 collects all of these by default
    dataCollection: { userInfo: false, cookies: false, httpBodies: [], databaseQueryData: false },
    beforeSendSpan: (span) => {
      for (const key of ["url.full", "url.path"]) {
        const value = span.attributes[key];
        if (typeof value === "string") span.attributes[key] = value.replace(INTERACTION_TOKEN, "[token]");
      }

      return span;
    },
    beforeBreadcrumb: (breadcrumb) => {
      const { data } = breadcrumb;
      if (typeof data?.url === "string") data.url = data.url.replace(INTERACTION_TOKEN, "[token]");
      return breadcrumb;
    },
    normalizeDepth: 3,
    tracesSampleRate: await config("sentry.tracesSampleRate"),
    environment: await config("environment"),
  });
}
