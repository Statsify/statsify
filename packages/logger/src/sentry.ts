/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { config } from "@statsify/util";
import type { NodeOptions } from "@sentry/node";

type SentryDsnKey = Extract<
  Parameters<typeof config>[0],
  `sentry.${string}Dsn`
>;

// Discord's callback and webhook paths carry the interaction token, which can reply as the bot
const INTERACTION_TOKEN = /(?<=\/(?:interactions|webhooks)\/\d+\/)[^/?]+/;

const redactInteractionToken = (url: string) =>
  url.replace(INTERACTION_TOKEN, "[token]");

export const redactInteractionTokens = {
  beforeSendSpan: (span) => {
    for (const key of ["url.full", "url.path"]) {
      const value = span.attributes[key];
      if (typeof value === "string")
        span.attributes[key] = redactInteractionToken(value);
    }

    return span;
  },
  beforeBreadcrumb: (breadcrumb) => {
    const { data } = breadcrumb;
    if (typeof data?.url === "string")
      data.url = redactInteractionToken(data.url);
    return breadcrumb;
  },
} satisfies NodeOptions;

export const sentryOptions = async (dsnKey: SentryDsnKey) => {
  const dsn = await config(dsnKey, { required: false });

  return {
    dsn,
    // Sentry 11 collects all of these by default
    dataCollection: {
      userInfo: false,
      cookies: false,
      httpBodies: [],
      databaseQueryData: false,
    },
    normalizeDepth: 3,
    tracesSampleRate: await config("sentry.tracesSampleRate", {
      required: dsn !== undefined,
    }),
    environment: await config("environment"),
  } satisfies NodeOptions;
};

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;

  it("redacts the interaction token from callback and webhook urls", () => {
    expect(
      redactInteractionToken(
        "https://discord.com/api/v10/interactions/123/abc.DEF-ghi/callback?with_response=true",
      ),
    ).toBe(
      "https://discord.com/api/v10/interactions/123/[token]/callback?with_response=true",
    );
    expect(
      redactInteractionToken(
        "/api/v10/webhooks/456/abc.DEF-ghi/messages/@original",
      ),
    ).toBe("/api/v10/webhooks/456/[token]/messages/@original");
    expect(redactInteractionToken("/api/v10/channels/789/messages")).toBe(
      "/api/v10/channels/789/messages",
    );
  });
}
