/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { searchParam } from "~/features/game/game-data";

/** The guild page's Compare form sent without scripts: on to the comparison's own URL, which resolves both names. */
export const Route = createFileRoute("/{-$locale}/guild/$name/compare/")({
  validateSearch: (search: Record<string, unknown>) => ({ b: searchParam(search.b) }),
  loaderDeps: ({ search }) => search,
  loader: ({ params, deps: { b } }) => {
    if (!b) throw notFound();
    throw redirect({ to: "/{-$locale}/guild/$name/compare/$b", params: { name: params.name, b: b.trim() } });
  },
});
