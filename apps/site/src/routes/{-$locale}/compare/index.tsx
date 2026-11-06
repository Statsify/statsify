/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { gameSearch, searchParam } from "~/features/game/game-data";

/** The game page's Compare form sent without scripts: on to the comparison's own URL, which resolves both names. */
export const Route = createFileRoute("/{-$locale}/compare/")({
  validateSearch: (search: Record<string, unknown>) => ({
    a: searchParam(search.a),
    b: searchParam(search.b),
    game: searchParam(search.game),
    ...gameSearch(search),
  }),
  loaderDeps: ({ search }) => search,
  loader: ({ deps: { a, b, game, mode, submode, period } }) => {
    if (!a || !b || !game) throw notFound();
    throw redirect({ to: "/{-$locale}/compare/$a/$b/$game", params: { a, b: b.trim(), game }, search: { mode, submode, period } });
  },
});
