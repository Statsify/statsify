/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { GlossaryPage } from "~/features/content/glossary-page";
import { TEXT_PAGE_CACHE, textPageHead } from "~/features/content/text-page-head";
import { cacheHeaders } from "~/lib/cache";
import { createFileRoute } from "@tanstack/react-router";
import { getGlossary } from "~/features/content/content-data";

/** Schema metadata and locale files: it changes with a deploy, like the leaderboard list. */
export const Route = createFileRoute("/{-$locale}/glossary")({
  loader: ({ context }) => getGlossary({ data: { locale: context.locale } }),
  staleTime: Infinity,
  head: ({ matches }) =>
    textPageHead({ meta: "glossary", path: "/glossary", matches }),
  headers: () => cacheHeaders(TEXT_PAGE_CACHE),
  component: GlossaryRoute,
});

function GlossaryRoute() {
  return <GlossaryPage groups={Route.useLoaderData()} />;
}
