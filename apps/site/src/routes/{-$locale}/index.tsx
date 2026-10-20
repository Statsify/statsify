/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Home } from "~/features/home/home";
import { cacheHeaders } from "~/lib/cache";
import { createFileRoute } from "@tanstack/react-router";
import { getHomeData } from "~/features/home/home-data";

const EDGE_TTL_SECONDS = 600;

export const Route = createFileRoute("/{-$locale}/")({
  loader: () => getHomeData(),
  staleTime: EDGE_TTL_SECONDS * 1000,
  headers: () => cacheHeaders(`max-age=${EDGE_TTL_SECONDS}, stale-while-revalidate=86400`),
  component: HomePage,
});

function HomePage() {
  const data = Route.useLoaderData();
  return <Home {...data} />;
}
