/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { PageBackground } from "~/components/ui/background";
import { SearchIcon } from "~/components/icons/search";
import { cacheHeaders } from "~/lib/cache";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { searchPageMeta } from "~/lib/social-meta";
import { searchParam } from "~/features/game/game-data";
import { useTranslation } from "react-i18next";

/**
 * A guild's name opens its page; the API can't search guilds, so there are no suggestions. A form, so it works before the
 * page's scripts load (it sends `?name=` here, and the loader on); with them, it navigates in place.
 */
export const Route = createFileRoute("/{-$locale}/guild/")({
  validateSearch: (search: Record<string, unknown>): { name?: string } => ({ name: searchParam(search.name)?.trim() || undefined }),
  loaderDeps: ({ search }) => search,
  loader: ({ deps: { name } }) => {
    if (name) throw redirect({ to: "/{-$locale}/guild/$name", params: { name } });
  },
  head: ({ matches }) => ({
    meta: searchPageMeta(matches, { key: "guilds", nav: "guilds", path: "/guild", image: "/images/og-home.png" }),
  }),
  headers: () => cacheHeaders("max-age=600, stale-while-revalidate=86400"),
  component: GuildSearchPage,
});

function GuildSearchPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="relative grow">
      <PageBackground background="guilds" viewport mask="linear-gradient(rgb(255 255 255) 20%, rgb(0 0 0 / 0) 95%)" />
      <div className="w-container flex flex-col items-center gap-8 px-4 py-12 text-mc-white md:px-8">
        <h1 className="text-center text-mc-2 lg:text-mc-3 font-bold">{t("guild.search.heading")}</h1>
        <form
          method="get"
          onSubmit={(event) => {
            event.preventDefault();
            const name = String(new FormData(event.currentTarget).get("name")).trim();
            if (name) void navigate({ to: "/{-$locale}/guild/$name", params: { name } });
          }}
          className="flex h-16 w-full max-w-200 items-center gap-4 bg-blackify-800 px-4 focus-within:focus-ring-inset"
        >
          <SearchIcon className="size-8 shrink-0 text-mc-gray" />
          <input
            name="name"
            required
            maxLength={32}
            autoComplete="off"
            spellCheck={false}
            enterKeyHint="search"
            aria-label={t("guild.search.label")}
            placeholder={t("guild.search.placeholder")}
            className="placeholder:text-mc-gray text-white focus-ring-none h-full w-full min-w-0 text-ellipsis selection:bg-white/50 text-mc-2"
          />
        </form>
      </div>
    </div>
  );
}
