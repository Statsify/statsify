/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { NOT_FOUND_EDGE, NO_STORE, RETRY_AFTER_SECONDS, cacheHeaders } from "~/lib/cache";
import { rpcHeaders, rpcUrl } from "./rpc.server";

/**
 * Each GET procedure the browser may call through `/api/rpc/<procedure>`: its edge TTL in seconds and
 * the query parameters it takes (`names` arrives as `names[0]`, `names[1]`, …). `player.full`, `player.refresh`
 * and `player.lookup` are deliberately absent: they stay server-only.
 */
const RPC_PROCEDURES = new Map<string, { ttl: number; params: readonly string[] }>([
  ["player/resolve", { ttl: 60, params: ["name", "uuid"] }],
  ["player/page", { ttl: 60, params: ["uuid"] }],
  ["player/bingo", { ttl: 300, params: ["uuid"] }],
  ["player/game", { ttl: 60, params: ["uuid", "game", "mode", "submode", "period"] }],
  ["search/suggest", { ttl: 30, params: ["query"] }],
  ["search/cards", { ttl: 60, params: ["names"] }],
  ["leaderboard/list", { ttl: 3600, params: [] }],
  ["leaderboard/game", { ttl: 3600, params: ["key"] }],
  ["leaderboard/page", { ttl: 60, params: ["field", "page", "size", "around"] }],
  ["home/previews", { ttl: 600, params: [] }],
  ["content/prestiges", { ttl: 3600, params: [] }],
]);

const json = (status: number, body: Record<string, unknown>, headers: Record<string, string> = {}) =>
  Response.json({ status, ...body }, { status, headers: { ...NO_STORE, ...headers } });

/**
 * The query string the API sees: only the procedure's own parameters, in a fixed order. `null` when the request
 * carries anything else, so a made-up parameter can't mint a new edge cache key that reaches the API.
 */
function upstreamSearch(search: string, params: readonly string[]): string | null {
  const incoming = new URLSearchParams(search);
  const outgoing = new URLSearchParams();

  for (const [key, value] of incoming) {
    const name = key.replace(/\[\d+\]$/, "");
    if (!params.includes(name)) return null;
    outgoing.append(key, value);
  }

  outgoing.sort();
  const query = outgoing.toString();
  return query ? `?${query}` : "";
}

/**
 * Unknown players are cached at the edge for 5 minutes, but not a name `player/resolve` didn't find: a Hypixel lookup
 * can add the player a moment later, and the page it opens then resolves the same URL. Other failures are never cached.
 */
function proxyCacheHeaders(status: number, ttl: number, byName: boolean): Record<string, string> {
  if (status === 200) return cacheHeaders(`max-age=${ttl}`);
  if (status === 404 && !byName) return cacheHeaders(NOT_FOUND_EDGE);
  return NO_STORE;
}

/**
 * Forwards an allow-listed GET procedure to the API with the site key and stamps the edge TTL. The API refusing
 * (429), failing (5xx) or not answering at all becomes a 503 with `Retry-After`, so it's never cached and the
 * browser backs off.
 */
export async function proxyRpc(procedure: string, search: string): Promise<Response> {
  const entry = RPC_PROCEDURES.get(procedure);
  if (!entry) return json(404, { code: "NOT_FOUND", message: "Unknown procedure" });

  const query = upstreamSearch(search, entry.params);
  if (query === null) return json(400, { code: "BAD_REQUEST", message: "Unknown query parameter" });

  const upstream = await fetch(`${await rpcUrl()}/${procedure}${query}`, { headers: await rpcHeaders() }).catch(() => null);

  if (!upstream || upstream.status === 429 || upstream.status >= 500) {
    await upstream?.body?.cancel();
    return json(
      503,
      { code: "SERVICE_UNAVAILABLE", message: "Statsify is busy, try again shortly" },
      { "Retry-After": String(RETRY_AFTER_SECONDS) }
    );
  }

  const byName = procedure === "player/resolve" && new URLSearchParams(query).has("name");
  const headers = new Headers(proxyCacheHeaders(upstream.status, entry.ttl, byName));
  headers.set("content-type", upstream.headers.get("content-type") ?? "application/json");

  return new Response(upstream.body, { status: upstream.status, headers });
}

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest;

  describe("upstreamSearch", () => {
    it("keeps only the procedure's parameters, in a fixed order, and refuses anything else", () => {
      expect(upstreamSearch("?page=2&field=wins", ["field", "page"])).toBe("?field=wins&page=2");
      expect(upstreamSearch("?names[1]=b&names[0]=a", ["names"])).toBe("?names%5B0%5D=a&names%5B1%5D=b");
      expect(upstreamSearch("?field=wins&cb=1", ["field", "page"])).toBeNull();
      expect(upstreamSearch("", ["field"])).toBe("");
    });
  });
}
