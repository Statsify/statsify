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

/** Nitro bundles its plugins apart from the app's server code, so each gets its own copy of this module. */
function state(): ShutdownState {
  const global = globalThis as typeof globalThis & { [KEY]?: ShutdownState };
  global[KEY] ??= { closing: false, closers: new Set() };
  return global[KEY];
}

export function onShutdown(close: Close): void {
  state().closers.add(close);
}

/** Nothing that would keep the process running may be opened once this is true. */
export function shuttingDown(): boolean {
  return state().closing;
}

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
