/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { cacheHeaders } from "~/lib/cache";
import { rpcServerClient } from "./rpc.server";
import { siteConfig } from "./config.server";

const NAMESPACE = "http://www.sitemaps.org/schemas/sitemap/0.9";

/** The children of `/sitemap.xml`, each served at `/sitemap-<name>.xml`. */
const SITEMAPS = ["static", "leaderboards"] as const;
type SitemapName = (typeof SITEMAPS)[number];

const isSitemapName = (name: string): name is SitemapName => (SITEMAPS as readonly string[]).includes(name);

/** The parameterless indexable pages. Player pages are not listed yet. */
const STATIC_PATHS = ["/", "/bingo", "/leaderboards", "/glossary", "/prestiges/bedwars", "/about", "/privacy", "/terms"] as const;

/** Sitemaps only change with the schema or the site, so a day at the edge. */
const EDGE_CACHE = "max-age=86400";

const XML_ESCAPES: Record<string, string> = { "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" };
const escapeXml = (text: string) => text.replaceAll(/[<>&'"]/g, (char) => XML_ESCAPES[char]);

/**
 * `/sitemap.xml` (no `name`) or one of its children. Nothing here touches Hypixel: the static list is
 * fixed and the leaderboard list is schema metadata from the API. A 404 for an unknown name, or while
 * `site.indexable` is off.
 */
export async function sitemapResponse(name?: string): Promise<Response> {
  const { publicUrl, indexable } = await siteConfig();
  if (!indexable || (name !== undefined && !isSitemapName(name))) {
    return new Response(null, { status: 404, headers: cacheHeaders("max-age=300") });
  }

  const body = name === undefined ? sitemapIndex(publicUrl) : await sitemap(name, publicUrl);

  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8", ...cacheHeaders(EDGE_CACHE) },
  });
}

function sitemapIndex(origin: string): string {
  return xmlDocument(
    "sitemapindex",
    SITEMAPS.map((name) => `<sitemap><loc>${escapeXml(`${origin}/sitemap-${name}.xml`)}</loc></sitemap>`)
  );
}

async function sitemap(name: SitemapName, origin: string): Promise<string> {
  const paths = name === "static" ? STATIC_PATHS : await leaderboardPaths();
  return xmlDocument(
    "urlset",
    paths.map((path) => `<url><loc>${escapeXml(origin + path)}</loc></url>`)
  );
}

/** The first page of every leaderboard; the paged and `around` variants are `noindex` and stay out. */
async function leaderboardPaths(): Promise<string[]> {
  const groups = await rpcServerClient.leaderboard.list();
  return groups.flatMap((group) => group.leaderboards.map(({ field }) => `/leaderboards/${field}`));
}

const xmlDocument = (root: string, entries: readonly string[]) =>
  `<?xml version="1.0" encoding="UTF-8"?>\n<${root} xmlns="${NAMESPACE}">\n${entries.join("\n")}\n</${root}>\n`;
