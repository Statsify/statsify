/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ORPCError } from "@orpc/client";
import { UUID_PATTERN } from "~/lib/uuid";
import { createServerFn } from "@tanstack/react-start";
import { getRequest, getRequestIP } from "@tanstack/react-start/server";
import { rpcServerClient } from "~/server/rpc.server";
import { verifyTurnstile } from "~/server/turnstile.server";
import { z } from "zod";
import type { BingoPlayer, GamePage, PlayerIdentity, PlayerPage } from "@statsify/contract";

/**
 * What the refresh and lookup actions hand back. Contract errors travel as values so the page can show a
 * countdown or a message; anything unexpected is thrown and reaches Sentry.
 */
export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: "NOT_FOUND" }
  | { ok: false; code: "TOO_MANY_REQUESTS"; retryAfter: number }
  | { ok: false; code: "UNAVAILABLE" }
  | { ok: false; code: "VERIFICATION" };

/**
 * How long a refresh or lookup may take in all, Turnstile included. Past it the visitor hears that Hypixel didn't
 * answer. The API has already spent the budget slot and keeps it, so a slow Hypixel can't be retried into more calls.
 */
const ACTION_TIMEOUT_MS = 10_000;

/**
 * The browser's own limit on a refresh or lookup, past the server's: a connection that hangs (a phone between networks,
 * a stalled proxy) ends in "Hypixel didn't answer" with the button back, not a spinner for good.
 */
export const BROWSER_TIMEOUT_MS = 12_000;

const RETRY_MARGIN_S = 5;

/** The visitor's address: nginx passes Cloudflare's `CF-Connecting-IP` through. */
function clientIp(): string {
  return getRequest().headers.get("cf-connecting-ip") ?? getRequestIP() ?? "unknown";
}

/** An action's outcome from what the API threw, or from `deadline` running out. */
function failure(error: unknown, deadline: AbortSignal): ActionResult<never> {
  if (deadline.aborted) return { ok: false, code: "UNAVAILABLE" };

  if (error instanceof ORPCError && error.defined) {
    if (error.code === "NOT_FOUND") return { ok: false, code: "NOT_FOUND" };
    if (error.code === "SERVICE_UNAVAILABLE") return { ok: false, code: "UNAVAILABLE" };

    if (error.code === "TOO_MANY_REQUESTS") {
      // A few seconds past the API's own wait, so a refresh or lookup the moment the countdown ends isn't refused again.
      const { retryAfter } = error.data as { retryAfter: number };
      return { ok: false, code: "TOO_MANY_REQUESTS", retryAfter: retryAfter + RETRY_MARGIN_S };
    }
  }

  throw error;
}

/**
 * Asks the API to refresh a known player from Hypixel, within the per-address and global budgets. `auto`: the page's
 * own update once it opened, which the API refuses sooner.
 */
export const refreshPlayer = createServerFn({ method: "POST" })
  .validator(z.object({ uuid: z.string().regex(UUID_PATTERN), auto: z.boolean().optional() }))
  .handler(async ({ data }): Promise<ActionResult<PlayerPage>> => {
    const signal = AbortSignal.timeout(ACTION_TIMEOUT_MS);

    try {
      return { ok: true, data: await rpcServerClient.player.refresh({ uuid: data.uuid, clientIp: clientIp(), auto: data.auto }, { signal }) };
    } catch (error) {
      return failure(error, signal);
    }
  });

/** Refreshes a known player like `refreshPlayer`, then hands back their Bingo boards. */
export const refreshBingo = createServerFn({ method: "POST" })
  .validator(z.object({ uuid: z.string().regex(UUID_PATTERN), auto: z.boolean().optional() }))
  .handler(async ({ data }): Promise<ActionResult<BingoPlayer>> => {
    const signal = AbortSignal.timeout(ACTION_TIMEOUT_MS);

    try {
      await rpcServerClient.player.refresh({ uuid: data.uuid, clientIp: clientIp(), auto: data.auto }, { signal });
      return { ok: true, data: await rpcServerClient.player.bingo({ uuid: data.uuid }, { signal }) };
    } catch (error) {
      return failure(error, signal);
    }
  });

/** Refreshes a known player like `refreshPlayer`, then hands back the page of the game they're on. */
export const refreshGame = createServerFn({ method: "POST" })
  .validator(
    z.object({
      uuid: z.string().regex(UUID_PATTERN),
      game: z.string().min(1).max(32),
      mode: z.string().min(1).max(32).optional(),
      submode: z.string().min(1).max(32).optional(),
      period: z.string().min(1).max(32).optional(),
      auto: z.boolean().optional(),
    })
  )
  .handler(async ({ data }): Promise<ActionResult<GamePage>> => {
    const signal = AbortSignal.timeout(ACTION_TIMEOUT_MS);

    try {
      await rpcServerClient.player.refresh({ uuid: data.uuid, clientIp: clientIp(), auto: data.auto }, { signal });
      const { uuid, game, mode, submode, period } = data;
      return { ok: true, data: await rpcServerClient.player.game({ uuid, game, mode, submode, period }, { signal }) };
    } catch (error) {
      return failure(error, signal);
    }
  });

/** Looks a guild the site hasn't stored up on Hypixel by name, as `lookupPlayer` does a player. */
export const lookupGuild = createServerFn({ method: "POST" })
  .validator(z.object({ name: z.string().trim().min(1).max(32), token: z.string().max(4096).optional() }))
  .handler(async ({ data }): Promise<ActionResult<{ name: string }>> => {
    const signal = AbortSignal.timeout(ACTION_TIMEOUT_MS);
    const ip = clientIp();

    if (!(await verifyTurnstile(data.token, ip))) return { ok: false, code: "VERIFICATION" };

    try {
      return { ok: true, data: await rpcServerClient.guild.lookup({ name: data.name, clientIp: ip }, { signal }) };
    } catch (error) {
      return failure(error, signal);
    }
  });

/** Looks an unknown name or UUID up on Hypixel once the visitor has passed Turnstile. */
export const lookupPlayer = createServerFn({ method: "POST" })
  .validator(
    z.object({ name: z.union([z.string().trim().min(1).max(16), z.string().regex(UUID_PATTERN)]), token: z.string().max(4096).optional() })
  )
  .handler(async ({ data }): Promise<ActionResult<PlayerIdentity>> => {
    const signal = AbortSignal.timeout(ACTION_TIMEOUT_MS);
    const ip = clientIp();

    if (!(await verifyTurnstile(data.token, ip))) return { ok: false, code: "VERIFICATION" };

    try {
      return { ok: true, data: await rpcServerClient.player.lookup({ name: data.name, clientIp: ip }, { signal }) };
    } catch (error) {
      return failure(error, signal);
    }
  });
