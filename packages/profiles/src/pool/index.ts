/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Piscina } from "piscina";
import type { RenderRequest } from "./protocol.js";

export { IMAGE_VARIANTS } from "./protocol.js";
export type { CardChoice, ImageVariant, RenderRequest } from "./protocol.js";

/** Every worker is busy and the queue is full; answer 503 with `Retry-After`. */
export class PoolBusyError extends Error {
  public readonly retryAfter = 2;

  public constructor() {
    super("The render queue is full");
    this.name = "PoolBusyError";
  }
}

export interface RenderPoolOptions {
  /** The worker script; this package's `worker.js` unless the caller is bundled elsewhere. */
  worker?: string;
  size?: number;
  /** Waiting jobs before `render` rejects with `PoolBusyError`. */
  queueLimit?: number;
  /** Covers waiting for a worker too. The site's render lock has to outlast it, or a second request draws the same card. */
  timeoutMs?: number;
}

/** Renders in worker threads, so a render never blocks the server's event loop. */
export class RenderPool {
  private readonly pool: Piscina<RenderRequest, Uint8Array<ArrayBuffer>>;
  private readonly queueLimit: number;
  private readonly timeoutMs: number;
  /** Set once a worker fails to start; every render rejects with it. */
  private broken?: Error;
  private rendered = false;

  public constructor(options: RenderPoolOptions = {}) {
    const size = options.size ?? 2;
    this.queueLimit = options.queueLimit ?? 16;
    this.timeoutMs = options.timeoutMs ?? 14_000;

    this.pool = new Piscina({
      filename: options.worker ?? new URL("./worker.js", import.meta.url).href,
      minThreads: size,
      maxThreads: size,
    });

    // Piscina emits `error` for a worker that fails outside a task, and replaces it. Before any render has worked, that
    // means workers can't start (missing fonts, say). Unhandled, the event would crash the site.
    this.pool.on("error", (error: Error) => {
      if (!this.rendered) this.broken = error;
    });
  }

  /** Jobs waiting for a worker. */
  public get pending(): number {
    return this.pool.queueSize;
  }

  public render(request: RenderRequest): Promise<Uint8Array<ArrayBuffer>> {
    if (this.broken) return Promise.reject(this.broken);
    // Piscina's own `maxQueue` rejects with a plain `Error`, which the site couldn't tell apart from a failed render.
    if (this.pool.queueSize >= this.queueLimit) return Promise.reject(new PoolBusyError());

    return this.pool.run(request, { signal: AbortSignal.timeout(this.timeoutMs) }).then((image) => {
      this.rendered = true;
      return image;
    });
  }

  public close(): Promise<void> {
    return this.pool.destroy();
  }
}

if (import.meta.vitest) {
  const { afterAll, afterEach, beforeAll, describe, expect, it, vi } = import.meta.vitest;
  const { mkdtemp, rm, writeFile } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");

  // A worker without skia-canvas that answers with its thread's id; `player` carries the behavior to test.
  const STUB_WORKER = `
    import { setTimeout as sleep } from "node:timers/promises";
    import { threadId } from "node:worker_threads";

    export default async ({ player: { behavior = "echo", delay = 0 } }) => {
      await sleep(delay);
      if (behavior === "hang") await new Promise(() => {});
      if (behavior === "fail") throw new Error("boom");
      return new Uint8Array([threadId]);
    };
  `;

  let directory: string;
  let stubWorker: string;
  let brokenWorker: string;

  beforeAll(async () => {
    directory = await mkdtemp(join(tmpdir(), "render-pool-"));
    stubWorker = join(directory, "stub.mjs");
    brokenWorker = join(directory, "broken.mjs");
    await writeFile(stubWorker, STUB_WORKER);
    await writeFile(brokenWorker, `throw new Error("no fonts");`);
  });

  afterAll(() => rm(directory, { recursive: true }));

  const skin = new Uint8Array();

  const request = (player: Record<string, unknown> = {}): RenderRequest => ({
    card: "general",
    variant: "og",
    player,
    guild: null,
    updatedAt: 0,
    skin,
  });

  const pools: RenderPool[] = [];

  const create = (options: RenderPoolOptions) => {
    const pool = new RenderPool({ worker: stubWorker, ...options });
    pools.push(pool);
    return pool;
  };

  afterEach(async () => {
    await Promise.all(pools.splice(0).map((pool) => pool.close()));
  });

  describe("RenderPool", () => {
    it("runs as many renders at once as it has workers", async () => {
      const pool = create({ size: 2 });

      const threads = await Promise.all([pool.render(request()), pool.render(request())]);

      expect(new Set(threads.map(([thread]) => thread)).size).toBe(2);
    });

    it("rejects with PoolBusyError once the queue is full", async () => {
      const pool = create({ size: 1, queueLimit: 1 });

      const running = pool.render(request({ delay: 50 }));
      const queued = pool.render(request());
      expect(pool.pending).toBe(1);

      await expect(pool.render(request())).rejects.toBeInstanceOf(PoolBusyError);
      await expect(Promise.all([running, queued])).resolves.toHaveLength(2);
    });

    it("rejects a render that fails or runs past the timeout, then renders on a new worker", async () => {
      const pool = create({ size: 1, timeoutMs: 200 });
      // The timeout also covers starting the worker, which can take longer on a busy machine.
      await vi.waitFor(() => pool.render(request()), { timeout: 5000 });

      await expect(pool.render(request({ behavior: "fail" }))).rejects.toThrow("boom");
      await expect(pool.render(request({ behavior: "hang" }))).rejects.toMatchObject({ name: "AbortError" });
      await vi.waitFor(() => pool.render(request()), { timeout: 5000 });
    });

    it("rejects renders once a worker fails to start", async () => {
      const pool = create({ worker: brokenWorker, size: 1, timeoutMs: 200 });
      await expect(pool.render(request())).rejects.toThrow("no fonts");

      // A render queued for the replacement worker waits out the timeout, so retry until its failure is recorded.
      await vi.waitFor(() => expect(pool.render(request())).rejects.toThrow("no fonts"), { timeout: 5000 });
    });
  });
}
