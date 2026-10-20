/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type ImageVariant, PoolBusyError, RenderPool } from "@statsify/profiles/pool";
import { cacheHeaders } from "~/lib/cache";
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

/** What an untracked player gets per variant: the site's own Open Graph image, under `public/images`. */
const PLACEHOLDERS: Record<ImageVariant, string> = { og: "og-home.png" };

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

/** The API could not render the player's skin; the card cannot be drawn without it. */
export class SkinUnavailableError extends Error {
  public constructor(public readonly status: number) {
    super(`Skin render responded with ${status}`);
    this.name = "SkinUnavailableError";
  }
}

type PlayerImage =
  /** The player's card, cached by UUID, `updatedAt` and variant. */
  | { kind: "card"; png: Uint8Array<ArrayBuffer> }
  /** The static placeholder for a player the API has never seen. */
  | { kind: "placeholder"; png: Uint8Array<ArrayBuffer> };

let pool: Promise<RenderPool> | undefined;
/** Image misses loading their player, skin and game check, each about to join the render queue. */
let loading = 0;
const placeholders = new Map<ImageVariant, Promise<Uint8Array<ArrayBuffer>>>();

/**
 * Every player image goes through here: resolve the player, answer from the Redis cache, or
 * render once under a lock so concurrent misses cost one render. The worker pool does the drawing
 * today; the API could take its place behind this one function. Nothing here calls Hypixel.
 */
export async function renderPlayerImage({ uuid, variant }: { uuid: string; variant: ImageVariant }): Promise<PlayerImage> {
  const identity = await resolvePlayer(uuid);
  if (!identity) return { kind: "placeholder", png: await placeholderImage(variant) };

  const key = `site:image:${variant}:${identity.uuid}:${identity.updatedAt}`;
  const lock = `${key}:lock`;
  const client = await redis();

  const cached = await client.getBuffer(key);
  if (cached) return { kind: "card", png: new Uint8Array(cached) };

  const locked = (await client.set(lock, "1", "PX", LOCK_TTL_MS, "NX")) === "OK";

  if (!locked) {
    const png = await waitForImage(client, key, lock);
    if (png) return { kind: "card", png: new Uint8Array(png) };
  }

  try {
    const png = await renderCard(identity.uuid, variant);
    await client.set(key, Buffer.from(png), "EX", CACHE_TTL_SECONDS);
    return { kind: "card", png };
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

  if (!identity) {
    return new Response(await placeholderImage("og"), {
      headers: { "Content-Type": "image/png", ...cacheHeaders("max-age=60") },
    });
  }

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

  const png = await client.getBuffer(key);
  if (png) return png;

  return (await client.exists(lock)) ? waitForImage(client, key, lock, deadline) : null;
}

/** The bot's general card for a stored player, as PNG bytes. Throws `PoolBusyError` when the queue is full. */
async function renderCard(uuid: string, variant: ImageVariant): Promise<Uint8Array<ArrayBuffer>> {
  // A miss reads the player and renders the skin (asking Mojang for it, if it's old) before it can queue, so a queue
  // with no room left, counting the misses still loading, answers busy first.
  const renders = await renderPool();
  if (renders.pending + loading >= RENDER_QUEUE_LIMIT) throw new PoolBusyError();

  loading++;
  const [full, skin] = await Promise.all([rpcServerClient.player.full({ uuid }), fetchSkin(uuid)]).finally(() => loading--);

  return renders.render({
    card: "general",
    variant,
    player: full.player,
    guild: full.guild,
    skin,
  });
}

async function fetchSkin(uuid: string): Promise<Uint8Array> {
  const response = await proxySkin("/skin", new URLSearchParams({ uuid }));
  if (!response.ok) throw new SkinUnavailableError(response.status);
  return new Uint8Array(await response.arrayBuffer());
}
