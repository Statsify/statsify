/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type ImageVariant, PoolBusyError, RenderPool } from "@statsify/profiles/pool";
import { cacheHeaders } from "~/lib/cache";
import { isUuid, normalizeUuid } from "@statsify/util/util";
import { createRequire } from "node:module";
import { join } from "node:path";
import { proxySkin } from "./skin.server";
import { readFile } from "node:fs/promises";
import { redis } from "./redis.server";
import { repoRoot } from "./repo-root.server";
import { resolvePlayer } from "~/features/player/resolve";
import { rpcServerClient } from "./rpc.server";
import { setTimeout as sleep } from "node:timers/promises";
import { onShutdown, shuttingDown } from "./shutdown.server";
import { siteConfig } from "./config.server";
import type { Redis } from "ioredis";

/**
 * What an untracked player gets per variant, under `public/images`: the site's own Open Graph image for
 * the unfurl, and a "player not found" card in each signature size.
 */
const PLACEHOLDERS: Record<ImageVariant, string> = {
  og: "og-home.png",
  sig: "sig-placeholder.png",
  card: "card-placeholder.png",
};

/** Only long enough for the requests waiting on a render: each PNG is about 300 KB in the leaderboard Redis. */
const CACHE_TTL_SECONDS = 20;
/** The first request for a missing image renders it under this lock; the others wait for its PNG. */
const LOCK_TTL_MS = 15_000;
const LOCK_POLL_MS = 100;
/**
 * Image misses still loading plus renders waiting for a worker, before the pool answers busy: about a second of
 * backlog at the cold render rate, so a forum thread's signatures or a Discord unfurl's burst render whole.
 */
const RENDER_QUEUE_LIMIT = 48;

const NO_STORE = { "Cache-Control": "no-store" };

/** How an image route caches. */
export interface ImagePolicy {
  image: Record<string, string>;
  /** Discord and forums cache whatever they get, so a placeholder expires quickly. */
  placeholder: Record<string, string>;
}

/** Longer than the page, since its `og:image` carries `?v=<updatedAt>` and a refresh changes the URL. */
export const UNFURL_POLICY: ImagePolicy = {
  image: cacheHeaders("max-age=600, stale-while-revalidate=3600"),
  placeholder: cacheHeaders("max-age=60"),
};

/** The URL never changes. Browsers keep it ten minutes, because a forum thread shows many at once. */
export const SIGNATURE_POLICY: ImagePolicy = {
  image: { "Cache-Control": "public, max-age=600", "CDN-Cache-Control": "max-age=3600, stale-while-revalidate=86400" },
  placeholder: { "Cache-Control": "public, max-age=60", "CDN-Cache-Control": "max-age=60" },
};

class SkinUnavailableError extends Error {
  public constructor(public readonly status: number) {
    super(`Skin render responded with ${status}`);
    this.name = "SkinUnavailableError";
  }
}

type PlayerImage =
  | { kind: "card"; png: Uint8Array<ArrayBuffer>; updatedAt: number }
  | { kind: "unchanged"; updatedAt: number }
  | { kind: "placeholder"; png: Uint8Array<ArrayBuffer> };

let pool: Promise<RenderPool> | undefined;
/** Image misses still loading their data, about to join the render queue. */
let loading = 0;
const placeholders = new Map<ImageVariant, Promise<Uint8Array<ArrayBuffer>>>();

/** The `ETag` of a player image: its `updatedAt`, which only the player page's refresh action changes. */
const etagOf = (updatedAt: number) => `"${updatedAt}"`;

const matchesEtag = (ifNoneMatch: string, etag: string) =>
  ifNoneMatch.split(",").some((candidate) => candidate.trim().replace(/^W\//, "") === etag);

/**
 * The handler behind `/og`, `/sig` and `/card`: reads the UUID in any spelling (dashed or not, any case),
 * renders through `renderPlayerImage` and turns its outcomes into responses under the route's `policy`. Every
 * spelling gets the image itself, not a redirect, because some forum image proxies don't follow redirects; the
 * pages always link the undashed form. Never calls Hypixel.
 */
export async function playerImageResponse(
  request: Request,
  uuidParam: string,
  variant: ImageVariant,
  policy: ImagePolicy
): Promise<Response> {
  if (!isUuid(uuidParam)) return new Response(null, { status: 404, headers: cacheHeaders("max-age=300") });
  const uuid = normalizeUuid(uuidParam);

  try {
    const image = await renderPlayerImage({
      uuid,
      variant,
      ifNoneMatch: request.headers.get("If-None-Match"),
    });

    switch (image.kind) {
      case "placeholder":
        return png(image.png, policy.placeholder);
      case "unchanged":
        return new Response(null, { status: 304, headers: { ...policy.image, ETag: etagOf(image.updatedAt) } });
      case "card":
        return png(image.png, { ...policy.image, ETag: etagOf(image.updatedAt) });
    }
  } catch (error) {
    if (error instanceof PoolBusyError) {
      return new Response(null, { status: 503, headers: { "Retry-After": String(error.retryAfter), ...NO_STORE } });
    }

    if (error instanceof SkinUnavailableError) return new Response(null, { status: 502, headers: NO_STORE });

    throw error;
  }
}

/** Renders once under a Redis lock, so concurrent misses cost one render. */
async function renderPlayerImage({
  uuid,
  variant,
  ifNoneMatch,
}: {
  uuid: string;
  variant: ImageVariant;
  ifNoneMatch: string | null;
}): Promise<PlayerImage> {
  const identity = await resolvePlayer(uuid);
  if (!identity) return { kind: "placeholder", png: await placeholderImage(variant) };

  const { updatedAt } = identity;
  if (ifNoneMatch && matchesEtag(ifNoneMatch, etagOf(updatedAt))) return { kind: "unchanged", updatedAt };

  const key = `site:image:${variant}:${identity.uuid}:${updatedAt}`;
  const lock = `${key}:lock`;
  const client = await redis();

  const cached = await client.getBuffer(key);
  if (cached) return { kind: "card", png: new Uint8Array(cached), updatedAt };

  const locked = (await client.set(lock, "1", "PX", LOCK_TTL_MS, "NX")) === "OK";

  if (!locked) {
    const waited = await waitForImage(client, key, lock);
    if (waited) return { kind: "card", png: new Uint8Array(waited), updatedAt };
  }

  try {
    const rendered = await renderCard(identity.uuid, variant, updatedAt);
    await client.set(key, Buffer.from(rendered), "EX", CACHE_TTL_SECONDS);
    return { kind: "card", png: rendered, updatedAt };
  } finally {
    if (locked) await client.del(lock);
  }
}

/** `/player/<name>.png`. An unknown name gets the placeholder, not an error, because Discord caches error responses. */
export async function playerImageByName(name: string): Promise<Response> {
  const identity = await resolvePlayer(name);

  if (!identity) return png(await placeholderImage("og"), UNFURL_POLICY.placeholder);

  return new Response(null, {
    status: 301,
    headers: { Location: `/og/${identity.uuid}.png`, ...cacheHeaders("max-age=600") },
  });
}

function placeholderImage(variant: ImageVariant): Promise<Uint8Array<ArrayBuffer>> {
  let image = placeholders.get(variant);

  if (!image) {
    image = readFile(join(repoRoot(), "apps/site/public/images", PLACEHOLDERS[variant])).then((file) => new Uint8Array(file));
    placeholders.set(variant, image);
  }

  return image;
}

export function warmRenderPool(): void {
  renderPool().catch(() => undefined);
}

const png = (bytes: Uint8Array<ArrayBuffer>, headers: Record<string, string>) =>
  new Response(bytes, { headers: { "Content-Type": "image/png", ...headers } });

function renderPool(): Promise<RenderPool> {
  if (shuttingDown()) return Promise.reject(new Error("The site is shutting down"));

  pool ??= siteConfig().then(({ renderWorkers }) => {
    const created = new RenderPool({
      // Resolved from `node_modules`, since Nitro bundles this file away from the package's own `worker.js`.
      worker: createRequire(import.meta.url).resolve("@statsify/profiles/worker"),
      size: renderWorkers,
      queueLimit: RENDER_QUEUE_LIMIT,
    });
    onShutdown(() => created.close());
    return created;
  });

  return pool;
}

async function waitForImage(
  client: Redis,
  key: string,
  lock: string,
  deadline = Date.now() + LOCK_TTL_MS
): Promise<Buffer | null> {
  if (Date.now() >= deadline) return null;
  await sleep(LOCK_POLL_MS);

  const image = await client.getBuffer(key);
  if (image) return image;

  return (await client.exists(lock)) ? waitForImage(client, key, lock, deadline) : null;
}

/** The bot's general card for a stored player, as PNG bytes. Throws `PoolBusyError` when the queue is full. */
async function renderCard(uuid: string, variant: ImageVariant, updatedAt: number): Promise<Uint8Array<ArrayBuffer>> {
  // A miss reads the player and renders the skin (asking Minecraft's session server for it, if it's old) before it
  // can queue, so a queue with no room left, counting the misses still loading, answers busy first.
  const renders = await renderPool();
  if (renders.pending + loading >= RENDER_QUEUE_LIMIT) throw new PoolBusyError();

  loading++;
  const [full, skin] = await Promise.all([rpcServerClient.player.full({ uuid }), fetchSkin(uuid)]).finally(() => loading--);

  return renders.render({
    card: "general",
    variant,
    player: full.player,
    guild: full.guild,
    updatedAt,
    skin,
  });
}

async function fetchSkin(uuid: string): Promise<Uint8Array> {
  const response = await proxySkin("/skin/stored", new URLSearchParams({ uuid }));
  if (!response.ok) throw new SkinUnavailableError(response.status);
  return new Uint8Array(await response.arrayBuffer());
}
