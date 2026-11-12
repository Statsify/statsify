/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { DEFAULT_LOCALE, type Locale, SUPPORTED_LOCALES } from "~/i18n/locales";
import { cacheHeaders } from "~/lib/cache";
import { createHash } from "node:crypto";
import { readGlossary } from "~/i18n/i18n.server";

interface BuiltWords {
  json: string;
  /** The first 12 hex digits of the JSON's SHA-256 with its locale, for its URL. */
  hash: string;
}

/** Built once a locale: the locale files change only with a deploy, which restarts the site. */
const built = new Map<Locale, Promise<BuiltWords>>();

/** Every stat's glossary words in a locale (`readGlossary`) as one JSON file, and its hash. */
export function glossaryWords(locale: Locale): Promise<BuiltWords> {
  let words = built.get(locale);

  if (!words) {
    words = readGlossary(locale).then((glossary) => {
      const json = JSON.stringify(glossary);
      return { json, hash: createHash("sha256").update(locale).update(json).digest("hex").slice(0, 12) };
    });
    // A failed read is tried again on the next request.
    words.catch(() => built.delete(locale));
    built.set(locale, words);
  }

  return words;
}

/**
 * `/glossary-<hash>.json`: a locale's glossary words, cached for good under their own hash, for the line under a
 * leaderboard's title and a stat's "?". A page from before a deploy asks for its old hash and gets today's English
 * words, cached for a minute only.
 */
export async function glossaryWordsResponse(hash: string): Promise<Response> {
  const words = (await Promise.all(SUPPORTED_LOCALES.map(glossaryWords))).find((locale) => locale.hash === hash);
  if (words) return wordsResponse(words.json, FOREVER);
  return wordsResponse((await glossaryWords(DEFAULT_LOCALE)).json, cacheHeaders("max-age=60"));
}

const FOREVER = { "Cache-Control": "public, max-age=31536000, immutable", "CDN-Cache-Control": "max-age=31536000" };

const wordsResponse = (json: string, cache: Record<string, string>) =>
  new Response(json, { headers: { "Content-Type": "application/json; charset=utf-8", ...cache } });
