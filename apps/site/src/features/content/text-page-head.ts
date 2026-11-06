/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { DEFAULT_LOCALE } from "~/i18n/locales";
import { createI18n } from "~/i18n/i18n";
import { localeData, socialMeta } from "~/lib/social-meta";

// Apart from the text pages' layout: their routes' `head()` uses these, and every page's first load carries what
// `head()` imports.

/** The edge cache of a page that changes only with a deploy: an hour fresh, a day stale. */
export const TEXT_PAGE_CACHE = "max-age=3600, stale-while-revalidate=86400";

/**
 * A text page's `head()`: its title and description, the unfurl tags with the site's card image, its trail under its
 * heading, and the reading font, which is in the first screen.
 */
export function textPageHead({
  path,
  matches,
  crumb,
  ...text
}: {
  /** The page's path without a locale, for `og:url`. */
  path: string;
  matches: ReadonlyArray<{ routeId: string; loaderData?: unknown }>;
  /** The `site.json` key of the page's name in its trail, where that's shorter than its heading (About). */
  crumb?: string;
} & (
  | {
    /**
     * The page's `meta.*` key in `site.json`, which has its title and description, in English like every head. Its
     * heading is `<meta>.title`.
     */
    meta: string;
  }
  // Privacy and terms stay English in the code.
  | { title: string; description: string }
)) {
  const locale = localeData(matches);
  const words = createI18n(DEFAULT_LOCALE, locale?.resources ?? {});
  const title = "meta" in text ? words.t(`meta.${text.meta}.title`) : `${text.title} | Statsify`;
  const description = "meta" in text ? words.t(`meta.${text.meta}.description`) : text.description;
  const heading = crumb ? words.t(crumb) : "meta" in text ? words.t(`${text.meta}.title`) : text.title;
  const origin = locale?.origin;

  return {
    meta: [
      { title },
      { name: "description", content: description },
      ...(origin ? socialMeta({ origin, path, title, description, image: "/images/og-home.png", trail: { name: heading } }) : []),
    ],
  };
}
