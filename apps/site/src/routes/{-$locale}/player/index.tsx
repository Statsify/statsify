/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Background } from "~/components/ui/background";
import { ResultCards } from "~/features/player/result-card";
import { Search } from "~/components/search";
import { UUID_PATTERN } from "~/lib/uuid";
import { cacheHeaders } from "~/lib/cache";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { rpc } from "~/lib/orpc";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import type { ResultCard } from "@statsify/contract";

/**
 * `?q=` shows result cards for the names the autocomplete suggests. The router parses `?q=123` to a
 * number and anyone can type a long query, so anything is accepted and cut down to a 16-character name, except a
 * pasted UUID, which opens that player's page.
 */
const SearchSchema = z.object({
  q: z
    .unknown()
    .transform((q) => {
      const query = typeof q === "string" || typeof q === "number" ? String(q).trim() : "";
      return (UUID_PATTERN.test(query) ? query : query.slice(0, 16)) || undefined;
    }),
});

export const Route = createFileRoute("/{-$locale}/player/")({
  validateSearch: SearchSchema,
  loaderDeps: ({ search }) => ({ q: search.q }),
  loader: async ({ deps }): Promise<{ q: string | undefined; cards: ResultCard[] }> => {
    if (!deps.q) return { q: undefined, cards: [] };
    if (UUID_PATTERN.test(deps.q)) throw redirect({ to: "/{-$locale}/player/$name", params: { name: deps.q } });

    const names = await rpc.search.suggest({ query: deps.q });
    const cards = names.length > 0 ? await rpc.search.cards({ names }) : [];

    return { q: deps.q, cards };
  },
  staleTime: 60_000,
  head: () => ({
    meta: [
      { title: "Search | Statsify" },
      { name: "description", content: "Search players to view their Hypixel stats." },
    ],
  }),
  headers: ({ loaderData }) =>
    cacheHeaders(loaderData?.q ? "max-age=60, stale-while-revalidate=600" : "max-age=600, stale-while-revalidate=86400"),
  component: PlayerSearchPage,
});

function PlayerSearchPage() {
  const { q, cards } = Route.useLoaderData();
  const { t } = useTranslation();

  return (
    <div className="relative grow">
      <Background
        background="general"
        priority
        viewport
        className="h-full"
        mask="linear-gradient(rgb(255 255 255) 20%, rgb(0 0 0 / 0) 95%)"
      />
      <div className="absolute h-full w-full bg-[rgb(17_17_17_/0.7)] -z-10" />
      <div className="w-container flex flex-col items-center gap-8 px-4 py-12 text-mc-white md:px-8">
        <h1 className="text-center text-mc-2 lg:text-mc-3 font-bold">{t("search.heading")}</h1>
        <Search key={q ?? ""} defaultValue={q ?? ""} target="results" className="w-full max-w-200" />
        {q && <ResultCards cards={cards} query={q} />}
      </div>
    </div>
  );
}
