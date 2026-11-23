/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { TEXT_PAGE_CACHE, textPageHead } from "~/features/content/text-page-head";
import { TermsPage } from "~/features/content/terms-page";
import { cacheHeaders } from "~/lib/cache";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/{-$locale}/terms")({
  head: ({ matches }) =>
    textPageHead({
      title: "Terms of Service",
      description: "The rules for using Statsify's site and bot.",
      path: "/terms",
      matches,
    }),
  headers: () => cacheHeaders(TEXT_PAGE_CACHE),
  component: TermsPage,
});
