/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

type Close = () => unknown;

interface ShutdownState {
  closing: boolean;
  closers: Set<Close>;
}

const KEY = Symbol.for("statsify.site.shutdown");

/**
 * What keeps the server process running after the HTTP server has closed: the render pool's workers, the Redis
 * connection and Sentry's queue. Each registers its close function here when it's created, and
 * `shutdown.plugin.ts` runs them from Nitro's `close` hook, which fires once in-flight requests are done after a
 * SIGINT (what pm2 sends) or a SIGTERM.
 *
 * Nitro bundles its plugins apart from the app's server code, so each side gets its own copy of this module. The
 * state lives on `globalThis` so both see the same.
 */
function state(): ShutdownState {
  const global = globalThis as typeof globalThis & { [KEY]?: ShutdownState };
  global[KEY] ??= { closing: false, closers: new Set() };
  return global[KEY];
}

/** Runs `close` when the server shuts down. */
export function onShutdown(close: Close): void {
  state().closers.add(close);
}

/** True once shutdown has begun. Nothing that would keep the process running may be opened after that. */
export function shuttingDown(): boolean {
  return state().closing;
}

/** Closes everything registered, each on its own, so one that fails doesn't keep the others open. */
export async function shutdown(): Promise<void> {
  const current = state();
  current.closing = true;

  const closers = [...current.closers];
  current.closers.clear();

  const results = await Promise.allSettled(closers.map(async (close) => close()));
  for (const result of results) {
    if (result.status === "rejected") console.error("[site] a resource failed to close:", result.reason);
  }
}
