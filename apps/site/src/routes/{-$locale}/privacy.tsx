/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { PrivacyPage } from "~/features/content/privacy-page";
import { TEXT_PAGE_CACHE, textPageHead } from "~/features/content/text-page";
import { cacheHeaders } from "~/lib/cache";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/{-$locale}/privacy")({
  head: ({ matches }) =>
    textPageHead({
      title: "Privacy Policy",
      description: "What Statsify collects, why, and how to see, change or delete it.",
      path: "/privacy",
      matches,
    }),
  headers: () => cacheHeaders(TEXT_PAGE_CACHE),
  component: PrivacyPage,
});
