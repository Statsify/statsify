/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { isUuid, normalizeUuid } from "@statsify/util/util";
import { PLACEHOLDER_UUID } from "~/lib/uuid";
import { resolvePlayer } from "~/features/player/resolve";
import { API_TIMEOUT_MS } from "./rpc.server";
import { siteConfig } from "./config.server";

/**
 * Proxies a skin image the Statsify API draws from the skin it has stored, with the site's key. Only the UUID is
 * forwarded, with the route's own fixed parameters.
 */
export async function proxySkin(
  path: "/skin/stored" | "/skin/head/stored" | "/skin/texture",
  search: URLSearchParams,
  fixed: Record<string, string> = {}
): Promise<Response> {
  const uuid = search.get("uuid");
  if (!uuid || !isPageQuery(uuid, search, fixed)) {
    return new Response(null, { status: 404, headers: { "Cache-Control": "no-store" } });
  }
  // Only a stored player's UUID, or the not-found pages' one fixed stand-in, gets an image drawn for it.
  if (uuid !== PLACEHOLDER_UUID && !(await resolvePlayer(uuid))) return new Response(null, { status: 404, headers: { "Cache-Control": "no-store" } });

  const { apiRoute, apiKey } = await siteConfig();
  if (!apiKey) return new Response("site.apiKey is not configured", { status: 503 });

  const url = new URL(path, apiRoute);
  url.searchParams.set("uuid", uuid);
  for (const [key, value] of Object.entries(fixed)) url.searchParams.set(key, value);

  const upstream = await fetch(url, { headers: { "x-api-key": apiKey }, signal: AbortSignal.timeout(API_TIMEOUT_MS) }).catch(() => null);

  // The API refusing (429), failing (5xx) or not answering is a 503 with `Retry-After`, so it's never cached and
  // browsers back off.
  if (!upstream || upstream.status === 429 || upstream.status >= 500) {
    await upstream?.body?.cancel();
    return new Response(null, { status: 503, headers: { "Cache-Control": "no-store", "Retry-After": "30" } });
  }

  if (!upstream.ok) {
    await upstream.body?.cancel();
    return new Response(null, { status: upstream.status === 404 ? 404 : 502, headers: { "Cache-Control": "no-store" } });
  }

  const model = upstream.headers.get("X-Skin-Model");
  return new Response(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "image/png",
      "Cache-Control": "public, max-age=3600",
      ...(model && { "X-Skin-Model": model }),
    },
  });
}

/** Only the query the pages send: any other spelling would be one more edge cache key reaching the API. */
function isPageQuery(uuid: string, search: URLSearchParams, fixed: Record<string, string>): boolean {
  const keys = [...search.keys()];
  return (
    isUuid(uuid) &&
    normalizeUuid(uuid) === uuid &&
    new Set(keys).size === keys.length &&
    keys.every((key) => key === "uuid" || search.get(key) === fixed[key])
  );
}
