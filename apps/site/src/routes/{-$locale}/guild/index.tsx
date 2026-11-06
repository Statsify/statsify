/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { PageBackground } from "~/components/ui/background";
import { Search } from "~/components/search";
import { cacheHeaders } from "~/lib/cache";
import { createFileRoute } from "@tanstack/react-router";
import { searchPageMeta } from "~/lib/social-meta";
import { useTranslation } from "react-i18next";

/** A guild's name opens its page, with the guilds Statsify has stored suggested as it's typed. */
export const Route = createFileRoute("/{-$locale}/guild/")({
  head: ({ matches }) => ({
    meta: searchPageMeta(matches, { key: "guilds", nav: "guilds", path: "/guild", image: "/images/og-home.png" }),
  }),
  headers: () => cacheHeaders("max-age=600, stale-while-revalidate=86400"),
  component: GuildSearchPage,
});

function GuildSearchPage() {
  const { t } = useTranslation();

  return (
    <div className="relative grow">
      <PageBackground background="guilds" viewport mask="linear-gradient(rgb(255 255 255) 20%, rgb(0 0 0 / 0) 95%)" />
      <div className="w-container flex flex-col items-center gap-8 px-4 py-12 text-mc-white md:px-8">
        <h1 className="text-center text-mc-2 lg:text-mc-3 font-bold">{t("guild.search.heading")}</h1>
        <div className="w-full max-w-200">
          <Search target="guild" placeholder={t("guild.search.placeholder")} shortcut />
        </div>
      </div>
    </div>
  );
}
