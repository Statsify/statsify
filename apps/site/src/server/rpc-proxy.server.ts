/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type AnyContractProcedure, type AnyContractRouter, isContractProcedure } from "@orpc/contract";
import { NOT_FOUND_EDGE, NO_STORE, cacheHeaders } from "~/lib/cache";
import { fetchApi, rpcUrl, unavailable } from "./rpc.server";
import { contract } from "@statsify/contract";
import { z } from "zod";

const procedures = (router: AnyContractRouter): AnyContractProcedure[] =>
  isContractProcedure(router) ? [router] : Object.values(router).flatMap(procedures);

/** The query parameters an input takes: its object's keys, or every option's for a union (`player/resolve`). */
function inputKeys(schema: unknown): string[] {
  if (schema instanceof z.ZodObject) return Object.keys(schema.shape);
  if (schema instanceof z.ZodUnion) return [...new Set(schema.options.flatMap(inputKeys))];
  return [];
}

/**
 * Each GET procedure the browser may call through `/api/rpc/<procedure>`, those the contract gives an edge TTL in
 * seconds, with the query parameters it takes (`names` arrives as `names[0]`, `names[1]`, …).
 */
const RPC_PROCEDURES = new Map(
  procedures(contract).flatMap(({ "~orpc": { route, meta, inputSchema } }) =>
    route.method === "GET" && route.path && typeof meta.edgeTtl === "number" ?
      [[route.path.slice(1), { ttl: meta.edgeTtl, params: inputKeys(inputSchema) }] as const] :
      []
  )
);

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

  const upstream = await fetchApi(`${await rpcUrl()}/${procedure}${query}`);
  if (!upstream) return unavailable({ status: 503, code: "SERVICE_UNAVAILABLE", message: "Statsify is busy, try again shortly" });

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

  describe("RPC_PROCEDURES", () => {
    it("opens the contract's GET procedures that have an edge TTL, with their input's parameters", () => {
      expect(RPC_PROCEDURES.get("player/resolve")).toEqual({ ttl: 60, params: ["name", "uuid"] });
      expect(RPC_PROCEDURES.get("leaderboard/page")).toEqual({ ttl: 60, params: ["field", "page", "size", "around"] });
      expect(RPC_PROCEDURES.get("leaderboard/list")).toEqual({ ttl: 3600, params: [] });
      expect(RPC_PROCEDURES.has("player/full")).toBe(false);
      expect(RPC_PROCEDURES.has("player/refresh")).toBe(false);
    });
  });
}
