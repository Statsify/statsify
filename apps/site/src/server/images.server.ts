/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  type CardChoice,
  type ImageVariant,
  PoolBusyError,
  RenderPool,
  isGameCard,
} from "@statsify/profiles/pool";
import { ORPCError } from "@orpc/client";
import { cacheHeaders } from "~/lib/cache";
import { compactUuid } from "~/lib/uuid";
import { createRequire } from "node:module";
import { join } from "node:path";
import { proxySkin } from "./skin.server";
import { randomUUID } from "node:crypto";
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
 * A game page's unfurl: the game's `PlayerStats` key, its `?mode=` and `?submode=`, `null` for the page's first mode
 * and the mode's first submode.
 */
export interface GameImage {
  game: string;
  mode: string | null;
  submode: string | null;
}

/** What a game or mode in an image URL can look like (`bedwars`, `4v4`, `oneBlock`, `ARENA_BRAWL`); the API decides the rest. */
const GAME_PARAM = /^\w{1,32}$/;

/**
 * `/og`'s `?game=`, `?mode=` and `?submode=`: `undefined` for the general card, `null` for a value that can't name a
 * page.
 */
export function gameImageOf(search: URLSearchParams): GameImage | null | undefined {
  const game = search.get("game");
  const mode = search.get("mode");
  const submode = search.get("submode");
  if (game === null) return mode === null && submode === null ? undefined : null;
  const named = (value: string | null) => value === null || GAME_PARAM.test(value);
  return GAME_PARAM.test(game) && named(mode) && named(submode) ? { game, mode, submode } : null;
}

/** The game or mode an image URL names has no page on the site. */
class GameImageNotFoundError extends Error {
  public constructor() {
    super("No game page for this image");
    this.name = "GameImageNotFoundError";
  }
}

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
/** How long the pool lets a render wait for a worker, and then run. */
const RENDER_QUEUE_TIMEOUT_MS = 6000;
const RENDER_TIMEOUT_MS = 8000;
/**
 * The first request for a missing image renders it under this lock; the others wait for its PNG. It outlasts the
 * owner's slowest path: 5 s to load the player and skin (the skin may come from Mojang), the queue, the render and 1 s
 * for the cache write. An owner slower than that only costs a second render.
 */
const LOCK_TTL_MS = 5000 + RENDER_QUEUE_TIMEOUT_MS + RENDER_TIMEOUT_MS + 1000;
const LOCK_POLL_MS = 100;
/** Frees the lock only while it holds the owner's token, so an owner that outlived its lock can't free the next one's. */
const RELEASE_LOCK = `if redis.call("get", KEYS[1]) == ARGV[1] then return redis.call("del", KEYS[1]) end return 0`;
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

const NOT_FOUND_HEADERS = cacheHeaders("max-age=300");

/** The `ETag` of a player image: its `updatedAt`, which only the player page's refresh action changes. */
const etagOf = (updatedAt: number) => `"${updatedAt}"`;

/** Whether an `If-None-Match` header lists `etag`, strong or weak, alone or among others. */
const matchesEtag = (ifNoneMatch: string, etag: string) =>
  ifNoneMatch.split(",").some((candidate) => candidate.trim().replace(/^W\//, "") === etag);

/**
 * The handler behind `/og`, `/sig` and `/card`: reads the UUID in any spelling (dashed or not, any case),
 * renders through `renderPlayerImage` and turns its outcomes into responses under the route's `policy`. Every
 * spelling gets the image itself, not a redirect, because some forum image proxies don't follow redirects; the
 * pages always link the undashed form. `game` asks for a game page's card instead of the general one. Never calls
 * Hypixel.
 */
export async function playerImageResponse(
  request: Request,
  uuidParam: string,
  variant: ImageVariant,
  policy: ImagePolicy,
  game?: GameImage
): Promise<Response> {
  const uuid = compactUuid(uuidParam);
  if (!uuid) return new Response(null, { status: 404, headers: NOT_FOUND_HEADERS });

  try {
    const image = await renderPlayerImage({
      uuid,
      variant,
      game,
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
    if (error instanceof GameImageNotFoundError) return new Response(null, { status: 404, headers: NOT_FOUND_HEADERS });

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
  game,
  ifNoneMatch,
}: {
  uuid: string;
  variant: ImageVariant;
  game?: GameImage;
  ifNoneMatch: string | null;
}): Promise<PlayerImage> {
  const identity = await resolvePlayer(uuid);
  if (!identity) return { kind: "placeholder", png: await placeholderImage(variant) };

  const { updatedAt } = identity;
  if (ifNoneMatch && matchesEtag(ifNoneMatch, etagOf(updatedAt))) return { kind: "unchanged", updatedAt };

  // A submode joins its mode as the catalog writes a place (`zombies.deadEnd`), so a page without one keeps its key.
  const card = game ? `${game.game}:${game.mode ?? ""}${game.submode === null ? "" : `.${game.submode}`}:` : "";
  const key = `site:image:${variant}:${card}${identity.uuid}:${updatedAt}`;
  const lock = `${key}:lock`;
  const client = await redis();

  const cached = await client.getBuffer(key);
  if (cached) return { kind: "card", png: new Uint8Array(cached), updatedAt };

  const token = randomUUID();
  const takeLock = async () => (await client.set(lock, token, "PX", LOCK_TTL_MS, "NX")) === "OK";

  if (!(await takeLock())) {
    const waited = await waitForImage(client, key, lock);
    if (waited) return { kind: "card", png: new Uint8Array(waited), updatedAt };
    // The owner failed or ran out of time: render as the next owner, or answer busy rather than render unlocked.
    if (!(await takeLock())) throw new PoolBusyError();
  }

  try {
    const rendered = await renderCard(identity.uuid, variant, updatedAt, game);
    await client.set(key, Buffer.from(rendered), "EX", CACHE_TTL_SECONDS);
    return { kind: "card", png: rendered, updatedAt };
  } finally {
    await client.eval(RELEASE_LOCK, 1, lock, token);
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
      queueTimeoutMs: RENDER_QUEUE_TIMEOUT_MS,
      timeoutMs: RENDER_TIMEOUT_MS,
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

  // The lock first: the owner writes the PNG before freeing it, so a free lock with no PNG means none is coming.
  const held = await client.exists(lock);
  const image = await client.getBuffer(key);
  if (image) return image;

  return held ? waitForImage(client, key, lock, deadline) : null;
}

/**
 * The game page's card: the API checks the game and mode (the page's own rules, so an unfurl exists exactly when the
 * page does), and a game whose card the pool can't draw yet gets the general one.
 */
async function gameCard(uuid: string, { game, mode, submode }: GameImage): Promise<CardChoice> {
  const page = await rpcServerClient.player.game({ uuid, game, mode: mode ?? undefined, submode: submode ?? undefined }).catch((error: unknown) => {
    if (error instanceof ORPCError && (error.code === "NOT_FOUND" || error.code === "BAD_REQUEST")) {
      throw new GameImageNotFoundError();
    }

    throw error;
  });

  if (!isGameCard(page.game.key, page.mode)) return { card: "general" };
  return { card: page.game.key, mode: page.mode, ...(page.submode !== null && { submode: page.submode }) };
}

/** One of the bot's cards for a stored player, as PNG bytes. Throws `PoolBusyError` when the queue is full. */
async function renderCard(
  uuid: string,
  variant: ImageVariant,
  updatedAt: number,
  game?: GameImage
): Promise<Uint8Array<ArrayBuffer>> {
  // A miss reads the player and renders the skin (asking Mojang for it, if it's old) before it can queue, so a queue
  // with no room left, counting the misses still loading, answers busy first.
  const renders = await renderPool();
  if (renders.pending + loading >= RENDER_QUEUE_LIMIT) throw new PoolBusyError();

  loading++;
  // The game check, the player and the skin are independent, so they load together.
  const loads = [
    game ? gameCard(uuid, game) : { card: "general" as const },
    rpcServerClient.player.full({ uuid }),
    fetchSkin(uuid),
  ] as const;
  // A failed load keeps the slot until the others settle, since they still run.
  await Promise.allSettled(loads);
  loading--;
  const [card, full, skin] = await Promise.all(loads);

  return renders.render({
    ...card,
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
