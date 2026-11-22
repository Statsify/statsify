/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type PageText, pageMeta } from "~/lib/social-meta";

// Apart from the text pages' layout: their routes' `head()` uses these, and every page's first load carries what
// `head()` imports.

/** The edge cache of a page that changes only with a deploy: an hour fresh, a day stale. */
export const TEXT_PAGE_CACHE = "max-age=3600, stale-while-revalidate=86400";

/** A text page's `head()`: its tags, with the site's card image. */
export const textPageHead = ({
  matches,
  ...page
}: { matches: ReadonlyArray<{ routeId: string; loaderData?: unknown }>; path: string; trail?: string } & PageText) => ({
  meta: pageMeta(matches, { ...page, image: "/images/og-home.png" }),
});
