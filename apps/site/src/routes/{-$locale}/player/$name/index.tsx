/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { DEFAULT_LOCALE } from "~/i18n/locales";
import { IMAGE_VARIANTS } from "@statsify/profiles/protocol";
import { PlayerView } from "~/features/player/player-page";
import { cacheHeaders } from "~/lib/cache";
import { EDGE_CACHE, possessive } from "~/lib/player-route";
import { playerTabIcon } from "~/lib/tab-icon";
import { createFileRoute } from "@tanstack/react-router";
import { LABEL_NAMESPACES, createI18n } from "~/i18n/i18n";
import { SEARCH_DESCRIPTION_MAX, localeData, socialMeta, statText, statsDescription } from "~/lib/social-meta";
import { playerPageQuery } from "~/features/player/resolve";
import { removeFormatting } from "@statsify/util/util";
import { useSuspenseQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/{-$locale}/player/$name/")({
  loader: async ({ context: { player: identity, queryClient } }) => {
    const page = await queryClient.ensureQueryData(playerPageQuery(identity.uuid));
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
    if (!loaderData) return {};

    const { username, uuid, updatedAt, headline } = loaderData;
    const origin = locale?.origin;
    const path = `/player/${username}`;
    const name = possessive(username);
    // The network level has no formatted form (the card prints a plain number), so it takes a game level's brackets.
    const title = words.t("meta.levelFirst", { level: `[${Math.floor(headline.level)}]`, title: words.t("meta.player.title", { name }) });
    const label = (key: string) => words.t(`stats.${key}`, { ns: LABEL_NAMESPACES });
    const parts = [
      statText(label("networkLevel"), headline.level),
      ...headline.games.map(({ name, level, rows }) => {
        const game = removeFormatting(level ? `${name} ${level}` : name);
        return `${game}: ${rows.map((row) => statText(label(row.key), row.hidden ? words.t("default:stats.hidden") : row.value)).join(", ")}`;
      }),
    ];
    const stats = statsDescription(parts);
    const description = statsDescription(parts, { lead: words.t("meta.player.lead", { name }), max: SEARCH_DESCRIPTION_MAX });

    return {
      meta: [
        { title },
        { name: "description", content: description },
        // `?v=` changes when the player is refreshed, so Discord fetches the new render.
        ...(origin ?
          socialMeta({
            origin,
            path,
            title,
            description: stats,
            image: `/og/${uuid}.png?v=${updatedAt}`,
            imageSize: IMAGE_VARIANTS.og,
            type: "profile",
            trail: { name: username },
          }) :
          []),
      ],
    };
  },
  headers: () => cacheHeaders(EDGE_CACHE),
  component: PlayerPage,
});

function PlayerPage() {
  const { uuid } = Route.useLoaderData();
  const { data: page } = useSuspenseQuery(playerPageQuery(uuid));

  return <PlayerView page={page} />;
}
