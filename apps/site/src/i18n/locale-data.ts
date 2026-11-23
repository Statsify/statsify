/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { SUPPORTED_LOCALES } from "./locales";
import { createServerFn } from "@tanstack/react-start";
import { loadResources } from "./i18n.server";
import { siteConfig } from "~/server/config.server";
import { z } from "zod";

const Input = z.object({ locale: z.enum(SUPPORTED_LOCALES) });

/** Everything the locale layout needs: translations plus the public bits of `config.js`. */
export const getLocaleData = createServerFn({ method: "GET" })
  .validator(Input)
  .handler(async ({ data }) => {
    const [resources, config] = await Promise.all([loadResources(data.locale), siteConfig()]);

    return {
      resources,
      turnstileSiteKey: config.turnstileSiteKey,
      sentry: {
        dsn: config.sentryDsn,
        environment: config.environment,
        tracesSampleRate: config.tracesSampleRate,
      },
    };
  });

export type LocaleData = Awaited<ReturnType<typeof getLocaleData>>;
