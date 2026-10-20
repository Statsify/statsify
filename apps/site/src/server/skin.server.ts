/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { siteConfig } from "./config.server";

const UUID = /^[\da-f]{32}$|^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i;

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
  if (!uuid || !UUID.test(uuid)) return new Response("uuid is required", { status: 400 });

  const { apiRoute, apiKey } = await siteConfig();
  if (!apiKey) return new Response("site.apiKey is not configured", { status: 503 });

  const url = new URL(path, apiRoute);
  url.searchParams.set("uuid", uuid);
  for (const [key, value] of Object.entries(fixed)) url.searchParams.set(key, value);

  const upstream = await fetch(url, { headers: { "x-api-key": apiKey } });

  if (!upstream.ok) {
    return new Response(null, {
      status: upstream.status === 404 ? 404 : 502,
      headers: { "Cache-Control": "no-store" },
    });
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "image/png",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
