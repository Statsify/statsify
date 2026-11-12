/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { captureServerError } from "~/server/sentry.server";
import { createIsomorphicFn } from "@tanstack/react-start";
import type { AnyRouter } from "@tanstack/react-router";

export interface SentryPublicConfig {
  dsn?: string;
  environment: string;
  tracesSampleRate: number;
}

/** The browser SDK once it has started, for the errors caught before then too. */
let sdk: Promise<typeof import("@sentry/tanstackstart-react")> | undefined;

/** When the browser is next idle, or in 3 s at the latest; Safari has no idle callback, so the next task there. */
const whenIdle = (callback: () => void) =>
  typeof requestIdleCallback === "function" ? requestIdleCallback(callback, { timeout: 3000 }) : setTimeout(callback, 1);

/** Once the page has loaded and the browser is idle. */
const afterLoadAndIdle = () =>
  new Promise<void>((resolve) => {
    if (document.readyState === "complete") whenIdle(resolve);
    else addEventListener("load", () => whenIdle(resolve), { once: true });
  });

/**
 * Starts the browser SDK once per page load; does nothing without a DSN. The SDK is its own 54 KB chunk, loaded once
 * the page has loaded and the browser is idle, so it never competes with the page's own requests or its first taps.
 */
export function startClientSentry(router: AnyRouter, { dsn, environment, tracesSampleRate }: SentryPublicConfig) {
  if (sdk || !dsn) return;

  sdk = afterLoadAndIdle()
    .then(() => import("@sentry/tanstackstart-react"))
    .then((Sentry) => {
      Sentry.init({
        dsn,
        environment,
        tracesSampleRate,
        release: import.meta.env.VITE_SENTRY_RELEASE,
        integrations: [Sentry.tanstackRouterBrowserTracingIntegration(router)],
      });
      return Sentry;
    });
}

/**
 * Reports an error the router caught and showed the error page for, which nothing else sees thrown: on the server to
 * Sentry and the log, in the browser to Sentry once the SDK has started (held until then).
 */
export const reportRouteError = createIsomorphicFn()
  .server((caught: unknown) => captureServerError(caught))
  .client((caught: unknown) => {
    void sdk?.then((Sentry) => Sentry.captureException(caught));
  });
