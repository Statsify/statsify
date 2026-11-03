/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import * as Sentry from "@sentry/tanstackstart-react";
import { siteConfig } from "./config.server";

let ready: Promise<void> | undefined;

/**
 * Initialises the server SDK once, on the first request, with the DSN from `config.js`.
 * Nothing happens when `sentry.siteDsn` is empty.
 */
export function ensureServerSentry(): Promise<void> {
  ready ??= init();
  return ready;
}

/** Reports an error the site answered itself, which Sentry's request middleware never sees thrown, and logs it. */
export function captureServerError(error: unknown): void {
  console.error(error);
  Sentry.captureException(error);
}

async function init() {
  const { sentryDsn, environment, tracesSampleRate } = await siteConfig();
  if (!sentryDsn) return;
  Sentry.init({ dsn: sentryDsn, environment, tracesSampleRate, release: import.meta.env.VITE_SENTRY_RELEASE });
}
