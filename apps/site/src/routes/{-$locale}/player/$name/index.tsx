/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { DEFAULT_LOCALE } from "~/i18n/locales";
import { IMAGE_VARIANTS } from "@statsify/profiles/protocol";
import { PlayerNotFound } from "~/features/player/player-not-found";
import { PlayerView } from "~/features/player/player-page";
import { cacheHeaders } from "~/lib/cache";
import { SANS_PRELOAD } from "~/lib/fonts";
import { cacheNotFoundResponse } from "~/lib/response";
import { playerTabIcon } from "~/lib/tab-icon";
import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { createI18n } from "~/i18n/i18n";
import { SEARCH_DESCRIPTION_MAX, localeData, socialMeta, statText, statsDescription } from "~/lib/social-meta";
import { plainText } from "~/components/ui/minecraft-text";
import { ensurePlayer, playerPageQuery } from "~/features/player/resolve";
import { useSuspenseQuery } from "@tanstack/react-query";

/** Fresh for a minute, stale for ten, and served stale for a day if the API is down. */
const EDGE_CACHE = "max-age=60, stale-while-revalidate=600, stale-if-error=86400";

const possessive = (username: string) => `${username}'${username.endsWith("s") ? "" : "s"}`;

export const Route = createFileRoute("/{-$locale}/player/$name/")({
  loader: async ({ params, context }) => {
    const identity = await ensurePlayer(context.queryClient, params.name);

    if (!identity) {
      // Five minutes at the edge. A lookup that finds the player navigates in the browser, so it never sees this page.
      cacheNotFoundResponse("max-age=300");
      throw notFound();
    }

    // UUIDs, old names and other casings all land on the current name. Names change hands, so
    // browsers and the edge keep the redirect for an hour rather than forever.
    if (identity.username !== params.name) {
      throw redirect({
        to: "/{-$locale}/player/$name",
        params: { name: identity.username },
        statusCode: 301,
        headers: { "Cache-Control": "public, max-age=3600", "CDN-Cache-Control": "max-age=3600" },
      });
    }

    const page = await context.queryClient.ensureQueryData(playerPageQuery(identity.uuid));
    // For the unfurl's text: the network level and the first numbers of the first games the page shows.
    const headline = {
      level: page.level.level,
      games: page.games.slice(0, 3).map(({ name, level, rows }) => ({ name, level, rows: rows.slice(0, 2) })),
    };

    return { ...identity, updatedAt: page.updatedAt, headline };
  },
  staleTime: 60_000,
  staticData: { tabIcon: playerTabIcon },
  head: ({ loaderData, matches }) => {
    const locale = localeData(matches);
    // The title, the description and a link preview's numbers, in English, from the server's `site.json`.
    const words = createI18n(DEFAULT_LOCALE, locale?.resources ?? {});
    if (!loaderData) {
      const title = words.t("meta.notFound.player");
      return { meta: [{ title }, { property: "og:title", content: title }, { name: "twitter:title", content: title }], links: [SANS_PRELOAD] };
    }

    const { username, uuid, updatedAt, headline } = loaderData;
    const origin = locale?.origin;
    const name = possessive(username);
    // The network level has no formatted form (the card prints a plain number), so it takes a game level's brackets.
    const title = words.t("meta.levelFirst", { level: `[${Math.floor(headline.level)}]`, title: words.t("meta.player.title", { name }) });
    const label = (key: string) => words.t(`stats.${key}`, { ns: ["default", "site"] });
    const parts = [
      statText(label("networkLevel"), headline.level),
      ...headline.games.map(({ name, level, rows }) => {
        const game = plainText(level ? `${name} ${level}` : name);
        return `${game}: ${rows.map((row) => statText(label(row.key), row.hidden ? words.t("default:stats.hidden") : row.value)).join(", ")}`;
      }),
    ];
    const stats = statsDescription(parts);
    const description = statsDescription(parts, { lead: words.t("meta.player.lead", { name }), max: SEARCH_DESCRIPTION_MAX });

    return {
      meta: [
        { title },
        { name: "description", content: description },
        // The Discord unfurl: the bot's general card at its UUID URL; `?v=` changes when the player is
        // refreshed, so Discord fetches the new render.
        ...(origin ?
          socialMeta({
            origin,
            path: `/player/${username}`,
            title,
            description: stats,
            image: `/og/${uuid}.png?v=${updatedAt}`,
            imageSize: IMAGE_VARIANTS.og,
            type: "profile",
          }) :
          []),
      ],
    };
  },
  headers: () => cacheHeaders(EDGE_CACHE),
  notFoundComponent: PlayerNotFound,
  component: PlayerPage,
});

function PlayerPage() {
  const { uuid } = Route.useLoaderData();
  const { data: page } = useSuspenseQuery(playerPageQuery(uuid));

  return <PlayerView page={page} />;
}
