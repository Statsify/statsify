/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { PLACEHOLDER_UUID, UUID_PATTERN } from "~/lib/uuid";
import { resolvePlayer } from "~/features/player/resolve";
import { siteConfig } from "./config.server";

/**
 * Proxies a skin image from the Statsify API with the site's key. Only the UUID is forwarded, with the route's own
 * fixed parameters.
 */
export async function proxySkin(
  path: "/skin" | "/skin/head",
  search: URLSearchParams,
  fixed: Record<string, string> = {}
): Promise<Response> {
  const uuid = search.get("uuid");
  if (!uuid || !UUID_PATTERN.test(uuid)) return new Response("uuid is required", { status: 400 });
  // The API doesn't limit the site's key on skins, so only a stored player's UUID, or the not-found pages' one fixed
  // stand-in, may reach Minecraft's session server.
  if (uuid !== PLACEHOLDER_UUID && !(await resolvePlayer(uuid))) return new Response(null, { status: 404, headers: { "Cache-Control": "no-store" } });

  const { apiRoute, apiKey } = await siteConfig();
  if (!apiKey) return new Response("site.apiKey is not configured", { status: 503 });

  const url = new URL(path, apiRoute);
  url.searchParams.set("uuid", uuid);
  for (const [key, value] of Object.entries(fixed)) url.searchParams.set(key, value);

  const upstream = await fetch(url, { headers: { "x-api-key": apiKey } }).catch(() => null);

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

  return new Response(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "image/png",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
