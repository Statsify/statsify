/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import i18next, { type Resource, type i18n } from "i18next";
import { DEFAULT_LOCALE } from "./locales";
import { formatNumber } from "./format";

/** The namespaces the site reads: its own strings and the bot's `stats.*` labels. */
const NAMESPACES = ["site", "default"] as const;

/** A stat's label: the bot's word in `default.json`, or the site's own for a stat the bot doesn't show. */
export const LABEL_NAMESPACES = ["default", "site"] as const;

/**
 * One i18next instance per request on the server and one per page load in the browser,
 * initialised synchronously from the resources the route loader provides.
 */
export function createI18n(locale: string, resources: Resource): i18n {
  const instance = i18next.createInstance();

  void instance.init({
    lng: locale,
    fallbackLng: DEFAULT_LOCALE,
    resources,
    ns: NAMESPACES,
    defaultNS: "site",
    initAsync: false,
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

  // The locale files' `{{value, number}}` uses the bot's abbreviated number format.
  instance.services.formatter?.add("number", (value: number, lng) => formatNumber(value, lng));

  return instance;
}
