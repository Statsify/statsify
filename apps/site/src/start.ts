/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  createCsrfMiddleware,
  createIsomorphicFn,
  createMiddleware,
  createServerOnlyFn,
  createStart,
} from "@tanstack/react-start";
import { captureServerError, ensureServerSentry } from "~/server/sentry.server";
import { redirectFor } from "~/lib/redirects";
import { sentryGlobalFunctionMiddleware, sentryGlobalRequestMiddleware } from "@sentry/tanstackstart-react";
import { siteConfig } from "~/server/config.server";

/**
 * Sentry's global middleware only do anything on the server. Building the list in a server-only branch
 * keeps the static import out of the browser entry, so the browser SDK stays in its own lazy chunk.
 */
const sentryMiddleware = createIsomorphicFn()
  .server(() => ({ request: [sentryGlobalRequestMiddleware], function: [sentryGlobalFunctionMiddleware] }))
  .client(() => ({ request: [], function: [] }));

const sentryInit = createMiddleware({ type: "request" }).server(async ({ next }) => {
  await ensureServerSentry();
  return next();
});

/** `/discord`, `/premium` and the other vanity links, and the old `/players/*` URLs. */
const redirects = createMiddleware({ type: "request" }).server(({ request, next }) => {
  const url = new URL(request.url);
  const target = redirectFor(url.pathname, url.search);
  if (!target) return next();

  return new Response(null, {
    status: 301,
    headers: {
      Location: target,
      "Cache-Control": "public, max-age=3600",
      "CDN-Cache-Control": "max-age=86400",
    },
  });
});

const publicOrigin = createServerOnlyFn(async () => new URL((await siteConfig()).publicUrl).origin);

/**
 * Server functions take requests from the site's own pages only. Browsers that send `Sec-Fetch-Site` are judged on
 * that; for the rest, `Origin` may also be `site.publicUrl`'s, because behind a proxy or tunnel that ends TLS the
 * request reaches the app as `http://` while the page was `https://`.
 */
const csrf = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
  origin: async (origin, { request }) => origin === new URL(request.url).origin || origin === (await publicOrigin()),
});

const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Content-Security-Policy": "frame-ancestors 'none'",
};

/** How long a visitor should wait after a server route failed. */
const RETRY_AFTER_SECONDS = 30;

/**
 * Errors never reach the edge cache: a 5xx or 429 replaces the route's `CDN-Cache-Control` with
 * `no-store`, so a deploy blip or an exhausted API key isn't pinned at Cloudflare. A server route that throws (an
 * image or a sitemap while the API is down) answers a 503 with `Retry-After` from here, with these headers, rather
 * than the server's bare 500. Server functions handle their own errors, and their answers are never cached.
 */
const responseHeaders = createMiddleware({ type: "request" }).server(async ({ next, handlerType }) => {
  let response: Response;
  let result: Awaited<ReturnType<typeof next>> | undefined;

  try {
    result = await next();
    // Responses passed straight through from `fetch` have immutable headers, so edit a copy.
    response = new Response(result.response.body, result.response);
  } catch (error) {
    if (handlerType === "serverFn") throw error;
    captureServerError(error);
    response = new Response(null, { status: 503, headers: { "Retry-After": String(RETRY_AFTER_SECONDS) } });
  }

  for (const [name, value] of Object.entries(SECURITY_HEADERS)) response.headers.set(name, value);

  if (response.status >= 500 || response.status === 429 || handlerType === "serverFn") {
    response.headers.set("Cache-Control", "no-store");
    response.headers.set("CDN-Cache-Control", "no-store");
  }

  return result ? { ...result, response } : response;
});

/** `/player/<name>.png` → the UUID image URL; the router would hand these to the player page's `$name`. */
const PLAYER_IMAGE = /^\/player\/([^/]+)\.png$/;

/**
 * Starts the unfurl render workers (fonts load once) on the first request rather than the first image, and
 * answers the by-name image URLs (see `playerImageByName`).
 */
const unfurlImages = createMiddleware({ type: "request" }).server(async ({ request, next }) => {
  const { playerImageByName, warmRenderPool } = await import("~/server/images.server");
  warmRenderPool();

  const match = PLAYER_IMAGE.exec(new URL(request.url).pathname);
  return match ? playerImageByName(decodeURIComponent(match[1])) : next();
});

export const startInstance = createStart(() => {
  const sentry = sentryMiddleware();

  return {
    requestMiddleware: [sentryInit, ...sentry.request, responseHeaders, redirects, csrf, unfurlImages],
    functionMiddleware: sentry.function,
  };
});
