/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { DEFAULT_LOCALE } from "~/i18n/locales";
import { EDGE_CACHE, REDIRECT_HEADERS, notFoundHead } from "~/lib/player-route";
import { GuildCompareView } from "~/features/compare/guild-compare";
import { GuildNotFoundView, guildPageQuery } from "~/features/guild/guild-page";
import { LABEL_NAMESPACES, createI18n } from "~/i18n/i18n";
import { SEARCH_DESCRIPTION_MAX, localeData, socialMeta, statsDescription, valueText } from "~/lib/social-meta";
import { cacheHeaders } from "~/lib/cache";
import { cacheNotFoundResponse } from "~/lib/response";
import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { orNull } from "~/lib/orpc";
import { preloadBackground } from "~/components/ui/background";
import { useSuspenseQuery } from "@tanstack/react-query";

/** The guild the comparison couldn't find, and whether it's the second one. */
type Missing = { name: string; second: boolean };

export const Route = createFileRoute("/{-$locale}/guild/$name/compare/$b")({
  loader: async ({ params, context }) => {
    const load = (name: string) => orNull(context.queryClient.ensureQueryData(guildPageQuery(name)), ["NOT_FOUND", "BAD_REQUEST"]);
    const [a, b] = await Promise.all([load(params.name), load(params.b)]);

    if (!a || !b) {
      cacheNotFoundResponse();
      throw notFound({ data: (a ? { name: params.b, second: true } : { name: params.name, second: false }) satisfies Missing });
    }

    if (a.name !== params.name || b.name !== params.b) {
      throw redirect({
        to: "/{-$locale}/guild/$name/compare/$b",
        params: { name: a.name, b: b.name },
        statusCode: 301,
        headers: REDIRECT_HEADERS,
      });
    }

    preloadBackground("guilds");

    return {
      a: a.name,
      b: b.name,
      // For the link preview's text, as on the guild page.
      headline: [
        { key: "level", values: [Math.floor(a.level), Math.floor(b.level)] },
        { key: "members", values: [a.memberCount, b.memberCount] },
        { key: "gexp", values: [a.exp, b.exp] },
        { key: "weekly-gexp", values: [a.weekly, b.weekly] },
      ],
    };
  },
  staleTime: 60_000,
  head: ({ loaderData, matches }) => {
    const locale = localeData(matches);
    const words = createI18n(DEFAULT_LOCALE, locale?.resources ?? {});
    if (!loaderData) return notFoundHead(words.t("meta.notFound.guild"));

    const { a, b, headline } = loaderData;
    const title = words.t("meta.compareGuilds.title", { a, b });
    const parts = headline.map(({ key, values }) =>
      `${words.t(`stats.guild.${key}`, { ns: LABEL_NAMESPACES })} ${values.map((value) => valueText(value)).join(" / ")}`);
    const description = statsDescription(parts, { lead: words.t("meta.compareGuilds.lead", { a, b }), max: SEARCH_DESCRIPTION_MAX });
    const origin = locale?.origin;

    return {
      meta: [
        { title },
        { name: "description", content: description },
        // Any two guilds make a page, so none is indexed.
        { name: "robots", content: "noindex" },
        ...(origin ?
          socialMeta({
            origin,
            path: `/guild/${encodeURIComponent(a)}/compare/${encodeURIComponent(b)}`,
            title,
            description: statsDescription(parts),
            image: "/images/og-home.png",
          }) :
          []),
      ],
    };
  },
  headers: () => cacheHeaders(EDGE_CACHE),
  notFoundComponent: GuildCompareNotFound,
  component: GuildComparePage,
});

/** The guild page's lookup; when it finds the second guild, the page reloads under the same first guild. */
function GuildCompareNotFound({ data }: { data?: unknown }) {
  const { name } = Route.useParams();
  const missing = data as Missing;
  return <GuildNotFoundView name={missing.name} first={missing.second ? name : undefined} />;
}

function GuildComparePage() {
  const { a, b } = Route.useLoaderData();
  const { data: first } = useSuspenseQuery(guildPageQuery(a));
  const { data: second } = useSuspenseQuery(guildPageQuery(b));

  return <GuildCompareView a={first} b={second} />;
}
