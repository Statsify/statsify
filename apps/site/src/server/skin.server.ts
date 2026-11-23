/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { fetchApi, unavailable } from "./rpc.server";
import { isUuid, normalizeUuid } from "@statsify/util/util";
import { NO_STORE } from "~/lib/cache";
import { PLACEHOLDER_UUID } from "~/lib/uuid";
import { UsernameSchema } from "@statsify/contract";
import { resolvePlayer } from "~/features/player/resolve";
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
    return new Response(null, { status: 404, headers: NO_STORE });
  }
  // A render or texture is drawn only for a stored player's UUID, or the not-found pages' one fixed stand-in. A head is
  // a small draw, so anyone's gets one: a guild's members needn't be stored players.
  if (path !== "/skin/head/stored" && uuid !== PLACEHOLDER_UUID && !(await resolvePlayer(uuid))) {
    return new Response(null, { status: 404, headers: NO_STORE });
  }

  return proxy(path, { uuid, ...fixed });
}

/** A search suggestion's head, by the suggested name: the stored player's 8×8 face, as `proxySkin` draws it. */
export async function proxyStoredHead(search: URLSearchParams): Promise<Response> {
  const name = UsernameSchema.safeParse(search.get("name"));
  if (!name.success) return new Response("name is required", { status: 400 });

  const player = await resolvePlayer(name.data);
  if (!player) return new Response(null, { status: 404, headers: NO_STORE });

  return proxy("/skin/head/stored", { uuid: player.uuid, size: "8" });
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
