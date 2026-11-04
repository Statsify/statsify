/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type ImageVariant, PoolBusyError, RenderPool } from "@statsify/profiles/pool";
import { cacheHeaders } from "~/lib/cache";
import { compactUuid } from "~/lib/uuid";
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

/**
 * Rendered PNGs stay in Redis only briefly (about 300 KB each, in the leaderboard Redis); Cloudflare holds them
 * for an hour anyway.
 */
const CACHE_TTL_SECONDS = 120;
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
  /** Headers on a rendered image. */
  image: Record<string, string>;
  /** Headers on the placeholder: Discord and forums cache whatever they get, so it expires quickly. */
  placeholder: Record<string, string>;
}

/**
 * `/og`: longer than the page, because its `og:image` carries `?v=<updatedAt>` and a refresh busts it. `ETag` turns
 * revalidations of an unchanged player into 304s; each game and mode has its own URL, so the tag needs no more.
 */
export const UNFURL_POLICY: ImagePolicy = {
  image: cacheHeaders("max-age=600, stale-while-revalidate=3600"),
  placeholder: cacheHeaders("max-age=60"),
};

/**
 * `/sig` and `/card`: the URL never changes, so the edge keeps the image for an hour and refreshes it in
 * the background for a day after that. Browsers keep it ten minutes, because a forum thread shows many
 * at once (the one place the browser policy is not `max-age=0`), and `ETag` turns revalidations into 304s.
 */
export const SIGNATURE_POLICY: ImagePolicy = {
  image: { "Cache-Control": "public, max-age=600", "CDN-Cache-Control": "max-age=3600, stale-while-revalidate=86400" },
  placeholder: { "Cache-Control": "public, max-age=60", "CDN-Cache-Control": "max-age=60" },
};

/** The API could not render the player's skin; the card cannot be drawn without it. */
class SkinUnavailableError extends Error {
  public constructor(public readonly status: number) {
    super(`Skin render responded with ${status}`);
    this.name = "SkinUnavailableError";
  }
}

type PlayerImage =
  /** The player's card, cached by UUID, `updatedAt` and variant. */
  | { kind: "card"; png: Uint8Array<ArrayBuffer>; updatedAt: number }
  /** The caller's `If-None-Match` names the current `updatedAt`, so the copy it holds is still right. */
  | { kind: "unchanged"; updatedAt: number }
  /** The static placeholder for a player the API has never seen. */
  | { kind: "placeholder"; png: Uint8Array<ArrayBuffer> };

let pool: Promise<RenderPool> | undefined;
/** Image misses loading their player, skin and game check, each about to join the render queue. */
let loading = 0;
const placeholders = new Map<ImageVariant, Promise<Uint8Array<ArrayBuffer>>>();

/** The `ETag` of a player image: its `updatedAt`, which only the player page's refresh action changes. */
const etagOf = (updatedAt: number) => `"${updatedAt}"`;

/** Whether an `If-None-Match` header lists `etag`, strong or weak, alone or among others. */
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
  const uuid = compactUuid(uuidParam);
  if (!uuid) return new Response(null, { status: 404, headers: cacheHeaders("max-age=300") });

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

/**
 * Every player image goes through here: resolve the player, answer from the Redis cache, or
 * render once under a lock so concurrent misses cost one render. The worker pool does the drawing
 * today; the API could take its place behind this one function. Nothing here calls Hypixel.
 */
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

/**
 * `/player/<name>.png`: a 301 to the UUID URL the pages use, so a renamed player keeps one cached
 * image, or the short-lived placeholder for an untracked name, because Discord caches error responses.
 * Served from a request middleware (`start.ts`): as a route, `/{-$locale}/player/$name` would win the match.
 */
export async function playerImageByName(name: string): Promise<Response> {
  const identity = await resolvePlayer(name);

  if (!identity) return png(await placeholderImage("og"), UNFURL_POLICY.placeholder);

  return new Response(null, {
    status: 301,
    headers: { Location: `/og/${identity.uuid}.png`, ...cacheHeaders("max-age=600") },
  });
}

/** The static image for `variant`, read once from `public/images`. */
function placeholderImage(variant: ImageVariant): Promise<Uint8Array<ArrayBuffer>> {
  let image = placeholders.get(variant);

  if (!image) {
    image = readFile(join(repoRoot(), "apps/site/public/images", PLACEHOLDERS[variant])).then((file) => new Uint8Array(file));
    placeholders.set(variant, image);
  }

  return image;
}

/** Starts the worker pool, which loads the fonts once, so the first unfurl does not pay for it. */
export function warmRenderPool(): void {
  renderPool().catch(() => undefined);
}

const png = (bytes: Uint8Array<ArrayBuffer>, headers: Record<string, string>) =>
  new Response(bytes, { headers: { "Content-Type": "image/png", ...headers } });

/**
 * One worker pool per process, `site.renderWorkers` threads, closed on shutdown. The worker script is
 * `@statsify/profiles`' own `dist`, resolved from the site's `node_modules` because Nitro bundles this file away
 * from its original location.
 */
function renderPool(): Promise<RenderPool> {
  if (shuttingDown()) return Promise.reject(new Error("The site is shutting down"));

  pool ??= siteConfig().then(({ renderWorkers }) => {
    const created = new RenderPool({
      worker: createRequire(import.meta.url).resolve("@statsify/profiles/worker"),
      size: renderWorkers,
      queueLimit: RENDER_QUEUE_LIMIT,
    });
    onShutdown(() => created.close());
    return created;
  });

  return pool;
}

/** Another request holds the lock: poll for its PNG until it appears or the lock is gone. */
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
  const response = await proxySkin("/skin", new URLSearchParams({ uuid }));
  if (!response.ok) throw new SkinUnavailableError(response.status);
  return new Uint8Array(await response.arrayBuffer());
}
