/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { DEFAULT_LOCALE } from "~/i18n/locales";
import { EDGE_CACHE, REDIRECT_HEADERS, notFoundHead } from "~/lib/player-route";
import { Error, ErrorText } from "~/components/ui/error";
import { GuildView, guildPageQuery } from "~/features/guild/guild-page";
import { HypixelLookup } from "~/features/player/player-not-found";
import { cacheHeaders } from "~/lib/cache";
import { cacheNotFoundResponse } from "~/lib/response";
import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { LABEL_NAMESPACES, createI18n } from "~/i18n/i18n";
import { SEARCH_DESCRIPTION_MAX, localeData, socialMeta, statText, statsDescription } from "~/lib/social-meta";
import { lookupGuild } from "~/features/player/player-actions";
import { orNull } from "~/lib/orpc";
import { preloadBackground } from "~/components/ui/background";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/{-$locale}/guild/$name")({
  loader: async ({ params, context }) => {
    // A name past Hypixel's 32 characters fails the contract's input, which is a guild we can't have either.
    const guild = await orNull(context.queryClient.ensureQueryData(guildPageQuery(params.name)), ["NOT_FOUND", "BAD_REQUEST"]);

    if (!guild) {
      // As for a player: a lookup that finds the guild navigates in the browser, so it never sees this page.
      cacheNotFoundResponse();
      throw notFound();
    }

    if (guild.name !== params.name) {
      throw redirect({ to: "/{-$locale}/guild/$name", params: { name: guild.name }, statusCode: 301, headers: REDIRECT_HEADERS });
    }

    preloadBackground("guilds");

    return {
      name: guild.name,
      // For the link preview's text.
      headline: { level: Math.floor(guild.level), members: guild.memberCount, exp: guild.exp, weekly: guild.weekly },
    };
  },
  staleTime: 60_000,
  head: ({ loaderData, matches }) => {
    const locale = localeData(matches);
    const words = createI18n(DEFAULT_LOCALE, locale?.resources ?? {});
    if (!loaderData) return notFoundHead(words.t("meta.notFound.guild"));

    const { name, headline } = loaderData;
    const title = words.t("meta.guild.title", { name });
    const label = (key: string) => words.t(`stats.guild.${key}`, { ns: LABEL_NAMESPACES });
    const parts = [
      statText(label("level"), headline.level),
      statText(label("members"), headline.members),
      statText(label("gexp"), headline.exp),
      statText(label("weekly-gexp"), headline.weekly),
    ];
    const stats = statsDescription(parts);
    const description = statsDescription(parts, { lead: words.t("meta.guild.lead", { name }), max: SEARCH_DESCRIPTION_MAX });
    const origin = locale?.origin;

    return {
      meta: [
        { title },
        { name: "description", content: description },
        ...(origin ?
          socialMeta({ origin, path: `/guild/${encodeURIComponent(name)}`, title, description: stats, image: "/images/og-home.png", trail: { name } }) :
          []),
      ],
    };
  },
  headers: () => cacheHeaders(EDGE_CACHE),
  notFoundComponent: GuildNotFound,
  component: GuildPage,
});

const lookupOnHypixel = (name: string, token: string | undefined, deadline: AbortSignal) => lookupGuild({ data: { name, token }, signal: deadline });

/** A guild the site hasn't stored, which Hypixel can be asked for, as a player can. */
function GuildNotFound() {
  const { t } = useTranslation();
  const { name } = Route.useParams();

  return (
    <Error>
      <div className="flex w-full max-w-160 flex-col items-center gap-4 self-center">
        <ErrorText heading={<h1 className="text-mc-3 lg:text-mc-4 text-mc-red font-bold">{t("guild.notFound.title")}</h1>}>
          <p className="text-mc-1.5 sm:text-mc-2 text-mc-gray text-center">{t("guild.notFound.description", { name })}</p>
        </ErrorText>
        <HypixelLookup name={name} lookup={lookupOnHypixel} found={(guild) => guild.name} unknown={t("guild.notFound.unknown", { name })} />
      </div>
    </Error>
  );
}

function GuildPage() {
  const { name } = Route.useLoaderData();
  const { data: guild } = useSuspenseQuery(guildPageQuery(name));

  return <GuildView guild={guild} />;
}
