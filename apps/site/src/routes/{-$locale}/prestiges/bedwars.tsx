/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { PrestigePage } from "~/features/content/prestige-page";
import { TEXT_PAGE_CACHE, textPageHead } from "~/features/content/text-page-head";
import { cacheHeaders } from "~/lib/cache";
import { createFileRoute } from "@tanstack/react-router";
import { getPrestiges } from "~/features/content/content-data";

/**
 * Every BedWars prestige. Under `/prestiges/` so other games' level sheets (SkyWars emblems, Duels titles) can join it
 * without a BedWars hub that doesn't exist. The sheet is code, so it changes only with a deploy.
 */
export const Route = createFileRoute("/{-$locale}/prestiges/bedwars")({
  loader: () => getPrestiges(),
  staleTime: Infinity,
  head: ({ matches }) =>
    textPageHead({ meta: "prestiges", path: "/prestiges/bedwars", matches }),
  headers: () => cacheHeaders(TEXT_PAGE_CACHE),
  component: PrestigesRoute,
});

function PrestigesRoute() {
  return <PrestigePage sheet={Route.useLoaderData()} />;
}
