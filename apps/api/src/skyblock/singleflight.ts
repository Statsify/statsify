/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

/** Concurrent calls for one key share the first call's promise until it settles. */
export class Singleflight {
  private readonly running = new Map<string, Promise<unknown>>();

  public run<T>(key: string, call: () => Promise<T>): Promise<T> {
    const running = this.running.get(key) as Promise<T> | undefined;
    if (running) return running;

    const promise = call().finally(() => this.running.delete(key));
    this.running.set(key, promise);
    return promise;
  }
}
