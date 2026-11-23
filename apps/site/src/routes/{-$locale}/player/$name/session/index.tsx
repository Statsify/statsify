/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { DEFAULT_LOCALE } from "~/i18n/locales";
import { EDGE_CACHE, notFoundHead, possessive } from "~/lib/player-route";
import { SessionNotFound } from "~/features/session/session-not-found";
import { SessionView } from "~/features/session/session-page";
import { cacheHeaders } from "~/lib/cache";
import { cacheNotFoundResponse } from "~/lib/response";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { createI18n } from "~/i18n/i18n";
import { localeData, socialMeta } from "~/lib/social-meta";
import { orNull } from "~/lib/orpc";
import { playerTabIcon } from "~/lib/tab-icon";
import { sessionPageQuery } from "~/features/session/session-data";
import { useSuspenseQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/{-$locale}/player/$name/session/")({
  loader: async ({ context: { player: identity, queryClient } }) => {
    const page = await orNull(queryClient.ensureQueryData(sessionPageQuery(identity.uuid)), ["NOT_FOUND"]);

    if (!page) {
      cacheNotFoundResponse();
      throw notFound();
    }

    return identity;
  },
  staleTime: 60_000,
  staticData: { tabIcon: playerTabIcon },
  head: ({ loaderData, matches }) => {
    const locale = localeData(matches);
    const words = createI18n(DEFAULT_LOCALE, locale?.resources ?? {});
    if (!loaderData) return notFoundHead(words.t("meta.notFound.session"));

    const { username } = loaderData;
    const name = possessive(username);
    const title = words.t("meta.session.title", { name });
    const description = words.t("meta.session.description", { name });
    const origin = locale?.origin;

    return {
      meta: [
        { title },
        { name: "description", content: description },
        // A session changes with every reset, so its pages aren't indexed.
        { name: "robots", content: "noindex" },
        ...(origin ?
          socialMeta({
            origin,
            path: `/player/${username}/session`,
            title,
            description,
            image: "/images/og-home.png",
            trail: { above: [{ name: username, path: `/player/${username}` }], name: words.t("session.title") },
          }) :
          []),
      ],
    };
  },
  headers: () => cacheHeaders(EDGE_CACHE),
  notFoundComponent: SessionNotFound,
  component: SessionPage,
});

function SessionPage() {
  const { uuid } = Route.useLoaderData();
  const { data: page } = useSuspenseQuery(sessionPageQuery(uuid));

  return <SessionView page={page} />;
}
