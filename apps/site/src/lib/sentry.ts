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

let sdk: Promise<typeof import("@sentry/tanstackstart-react")> | undefined;

// Safari has no `requestIdleCallback`.
const whenIdle = (callback: () => void) =>
  typeof requestIdleCallback === "function" ? requestIdleCallback(callback, { timeout: 3000 }) : setTimeout(callback, 1);

const afterLoadAndIdle = () =>
  new Promise<void>((resolve) => {
    if (document.readyState === "complete") whenIdle(resolve);
    else addEventListener("load", () => whenIdle(resolve), { once: true });
  });

/** The SDK loads once the page is idle, so it never competes with the page's own requests or its first taps. */
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

/** An error the router showed the error page for, which Sentry never sees thrown. */
export const reportRouteError = createIsomorphicFn()
  .server((caught: unknown) => captureServerError(caught))
  .client((caught: unknown) => {
    void sdk?.then((Sentry) => Sentry.captureException(caught));
  });
