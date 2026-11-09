/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { fetchApi, unavailable } from "./rpc.server";
import { NO_STORE } from "~/lib/cache";
import { compactUuid } from "~/lib/uuid";
import { UsernameSchema } from "@statsify/contract";
import { resolvePlayer } from "~/features/player/resolve";
import { siteConfig } from "./config.server";

/**
 * Proxies a skin image from the Statsify API with the site's key. Only the UUID is forwarded, with the route's own
 * fixed parameters.
 */
export async function proxySkin(
  path: "/skin" | "/skin/head" | "/skin/texture",
  search: URLSearchParams,
  fixed: Record<string, string> = {}
): Promise<Response> {
  const uuid = search.get("uuid");
  if (!uuid || !isPageQuery(uuid, search, fixed)) {
    return new Response(null, { status: 404, headers: NO_STORE });
  }
  // The API doesn't limit the site's key on skins, so a UUID it doesn't store must not reach Minecraft's session server.
  if (!(await resolvePlayer(uuid))) return new Response(null, { status: 404, headers: NO_STORE });

  return proxy(path, { uuid, ...fixed });
}

/**
 * A head from only the skin the API has stored, never a fresh lookup: a search suggestion's by the suggested name,
 * or a guild member's by UUID (`?uuid=<uuid>&stored`).
 */
export async function proxyStoredHead(search: URLSearchParams): Promise<Response> {
  const uuid = search.get("uuid");
  if (uuid !== null) {
    if (!isPageQuery(uuid, search, { stored: "" })) return new Response(null, { status: 404, headers: NO_STORE });
    return proxy("/skin/head/stored", { player: uuid });
  }

  const name = UsernameSchema.safeParse(search.get("name"));
  if (!name.success) return new Response("name is required", { status: 400 });

  return proxy("/skin/head/stored", { player: name.data });
}

async function proxy(path: string, params: Record<string, string>): Promise<Response> {
  const { apiRoute, apiKey } = await siteConfig();
  if (!apiKey) return new Response("site.apiKey is not configured", { status: 503 });

  const url = new URL(path, apiRoute);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);

  const upstream = await fetchApi(url);
  if (!upstream) return unavailable();

  if (!upstream.ok) {
    await upstream.body?.cancel();
    return new Response(null, { status: upstream.status === 404 ? 404 : 502, headers: NO_STORE });
  }

  const model = upstream.headers.get("X-Skin-Model");
  return new Response(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "image/png",
      "Cache-Control": "public, max-age=3600",
      // The texture's arm width, which the skin viewer reads.
      ...(model && { "X-Skin-Model": model }),
    },
  });
}

/**
 * Whether a skin request is one the pages make: the UUID as the API stores it (undashed, lower case) and no other
 * parameter than the route's own `fixed` ones, at their values. Any other spelling would be one more edge cache key for
 * the same player, each reaching the API.
 */
function isPageQuery(uuid: string, search: URLSearchParams, fixed: Record<string, string>): boolean {
  const keys = [...search.keys()];
  return (
    compactUuid(uuid) === uuid &&
    new Set(keys).size === keys.length &&
    keys.every((key) => key === "uuid" || search.get(key) === fixed[key])
  );
}
