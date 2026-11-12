/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { DEFAULT_LOCALE, type Locale, isSupportedLocale } from "~/i18n/locales";
import { type GlossaryWords, readGlossary } from "~/i18n/i18n.server";
import { type QueryClient, queryOptions } from "@tanstack/react-query";
import { createIsomorphicFn, createServerFn } from "@tanstack/react-start";
import { rpc } from "~/lib/orpc";
import { z } from "zod";
import type { GlossaryEntry } from "@statsify/contract";

/** How many of a stat's games its "Used in" line names before "and N more". */
const NAMED_GAMES = 3;

/** Where an entry's leaderboard link goes: its one leaderboard, its one game's index, or the index filtered by its label. */
export type BoardLink = { field: string } | { search: true } | null;

/** One stat as the glossary shows it, with its words in the page's locale. */
export interface GlossaryItem extends Pick<GlossaryEntry, "key" | "label" | "params" | "color" | "formula"> {
  name?: string;
  text: string;
  /** The first games that show it, by name, and how many more do. */
  games: string[];
  more: number;
  boards: number;
  link: BoardLink;
}

export interface GlossaryGroup {
  key: string;
  /** The game's name, for a game's own stats; the ratios and the shared stats are named by the page. */
  game: string | null;
  items: GlossaryItem[];
}

/**
 * Every stat's glossary words in the page's locale, for the line under a leaderboard's title and a stat cell's info:
 * the full name where a label shortens one, and what the stat is. The browser fetches them once a deploy, by the hash
 * the locale data carries (`/glossary-<hash>.json`), and keeps them for the visit.
 */
export const glossaryWordsQuery = (hash: string) =>
  queryOptions({
    queryKey: ["glossary-words", hash],
    queryFn: async (): Promise<GlossaryWords> => {
      const response = await fetch(`/glossary-${hash}.json`);
      if (!response.ok) throw new Error(`/glossary-${hash}.json answered ${response.status}`);
      return (await response.json()) as GlossaryWords;
    },
    staleTime: Infinity,
  });

interface WordsInput {
  queryClient: QueryClient;
  locale: Locale;
  /** The layout's `glossaryHash`. */
  hash: string;
}

/** The glossary words for a loader: read from the locale files on the server, the cached file in the browser. */
export const loadGlossaryWords = createIsomorphicFn()
  .server(({ locale }: WordsInput) => readGlossary(locale))
  .client(({ queryClient, hash }: WordsInput) => queryClient.ensureQueryData(glossaryWordsQuery(hash)));

/**
 * The glossary in a locale: the API's entries with their words, cut to what the page shows (the first games' names, not
 * every game's board count).
 */
export const getGlossary = createServerFn({ method: "GET" })
  .validator(z.object({ locale: z.string().max(16) }))
  .handler(async ({ data }): Promise<GlossaryGroup[]> => {
    const locale = isSupportedLocale(data.locale) ? data.locale : DEFAULT_LOCALE;
    const [{ games, groups }, words] = await Promise.all([glossary(), readGlossary(locale)]);

    return groups.map(({ key, entries }) => ({
      key,
      game: key === "ratios" || key === "shared" ? null : games[key],
      items: entries.map(({ games: shown, board, ...entry }) => {
        const ranked = shown.filter(({ boards }) => boards > 0);
        const boards = ranked.reduce((sum, { boards }) => sum + boards, 0);
        const link: BoardLink =
          board ? { field: board } :
          ranked.length === 1 ? { field: ranked[0].key } :
          boards > 0 ? { search: true } :
          null;

        return {
          ...entry,
          ...(words[entry.key]?.name && { name: words[entry.key].name }),
          text: words[entry.key]?.text ?? "",
          games: shown.slice(0, NAMED_GAMES).map(({ key }) => games[key]),
          more: Math.max(0, shown.length - NAMED_GAMES),
          boards,
          link,
        };
      }),
    }));
  });

/**
 * `load`, or its last answer when it fails. The glossary and the prestige sheet change only with a deploy, so their
 * pages keep answering through an API outage once the site has loaded them.
 */
function keepLast<T>(load: () => Promise<T>): () => Promise<T> {
  let last: T | undefined;

  return () =>
    load().then(
      (value) => (last = value),
      (error: unknown) => {
        if (last === undefined) throw error;
        return last;
      }
    );
}

const glossary = keepLast(() => rpc.content.glossary());

/** Every BedWars prestige, its star and bracket, for `/prestiges/bedwars`. */
export const getPrestiges = keepLast(() => rpc.content.prestiges());
