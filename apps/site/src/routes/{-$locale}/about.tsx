/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { AboutPage } from "~/features/content/about-page";
import { TEXT_PAGE_CACHE, textPageHead } from "~/features/content/text-page";
import { cacheHeaders } from "~/lib/cache";
import { createFileRoute } from "@tanstack/react-router";

/** `/contact` redirects to this page's `#contact`. */
export const Route = createFileRoute("/{-$locale}/about")({
  head: ({ matches }) =>
    textPageHead({
      title: "About Statsify",
      description: "Who runs Statsify, how to reach us, and where its stats come from.",
      path: "/about",
      matches,
    }),
  headers: () => cacheHeaders(TEXT_PAGE_CACHE),
  component: AboutPage,
});
