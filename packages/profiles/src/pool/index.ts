/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Worker, type WorkerOptions } from "node:worker_threads";
import type { RenderRequest, WorkerMessage, WorkerRequest } from "./protocol.js";

export { IMAGE_VARIANTS } from "./protocol.js";
export type { ImageVariant, RenderRequest } from "./protocol.js";

/** Every worker is busy and the queue is full; answer 503 with `Retry-After`. */
export class PoolBusyError extends Error {
  public readonly retryAfter = 2;

  public constructor() {
    super("The render queue is full");
    this.name = "PoolBusyError";
  }
}

/** A render ran past the limit; its worker was terminated and replaced. */
export class RenderTimeoutError extends Error {
  public constructor(timeoutMs: number) {
    super(`The render took longer than ${timeoutMs} ms`);
    this.name = "RenderTimeoutError";
  }
}

export interface RenderPoolOptions {
  /** The worker script; this package's `worker.js` unless the caller is bundled elsewhere. */
  worker?: string | URL;
  workerOptions?: WorkerOptions;
  /** Threads, 2 by default. The site sets it from `site.renderWorkers`. */
  size?: number;
  /** Waiting jobs before `render` rejects with `PoolBusyError`. */
  queueLimit?: number;
  /** A job running longer has its worker terminated and replaced. */
  timeoutMs?: number;
  /**
   * A job still waiting after this long is rejected with `PoolBusyError`. The site's render lock outlasts this plus
   * the render limit, so a second request never draws the same card.
   */
  queueTimeoutMs?: number;
  /** First delay before replacing a worker that died before it was ready; it doubles each time, up to 30 s. */
  respawnDelayMs?: number;
  /** Workers that may die before they're ready (missing fonts, say) before the pool stops replacing them. */
  maxStartupFailures?: number;
}

interface Job {
  request: RenderRequest;
  resolve: (png: Uint8Array<ArrayBuffer>) => void;
  reject: (error: Error) => void;
  /** Rejects the job if it's still queued at its deadline. */
  expiry: NodeJS.Timeout;
}

interface Running {
  id: number;
  job: Job;
  timer: NodeJS.Timeout;
}

const closedError = () => new Error("The render pool is closed");

const MAX_RESPAWN_DELAY_MS = 30_000;

/**
 * A `node:worker_threads` pool that owns skia-canvas and the fonts, so a render never shares the
 * server's event loop. A worker announces `ready` once its fonts are loaded; one that
 * fails, exits or hangs is replaced and its job rejected.
 */
export class RenderPool {
  private readonly worker: string | URL;
  private readonly workerOptions: WorkerOptions;
  private readonly queueLimit: number;
  private readonly timeoutMs: number;
  private readonly queueTimeoutMs: number;
  private readonly respawnDelayMs: number;
  private readonly maxStartupFailures: number;

  private readonly workers = new Set<Worker>();
  /** Spawned, fonts not loaded yet. */
  private readonly starting = new Set<Worker>();
  private readonly idle: Worker[] = [];
  private readonly running = new Map<Worker, Running>();
  private readonly queue: Job[] = [];
  private nextId = 0;
  private closed = false;
  private startupFailures = 0;
  /** Set once workers keep dying before they're ready; every render rejects with it. */
  private broken?: Error;

  public constructor(options: RenderPoolOptions = {}) {
    this.worker = options.worker ?? new URL("./worker.js", import.meta.url);
    this.workerOptions = options.workerOptions ?? {};
    this.queueLimit = options.queueLimit ?? 16;
    this.timeoutMs = options.timeoutMs ?? 8000;
    this.queueTimeoutMs = options.queueTimeoutMs ?? 6000;
    this.respawnDelayMs = options.respawnDelayMs ?? 250;
    this.maxStartupFailures = options.maxStartupFailures ?? 10;

    const size = options.size ?? 2;
    for (let index = 0; index < size; index++) this.spawn();
  }

  /** Jobs waiting for a worker. */
  public get pending(): number {
    return this.queue.length;
  }

  public render(request: RenderRequest): Promise<Uint8Array<ArrayBuffer>> {
    if (this.closed) return Promise.reject(closedError());
    if (this.broken) return Promise.reject(this.broken);
    if (this.queue.length >= this.queueLimit) return Promise.reject(new PoolBusyError());

    return new Promise((resolve, reject) => {
      const job: Job = {
        request,
        resolve,
        reject,
        expiry: setTimeout(() => {
          const index = this.queue.indexOf(job);
          if (index === -1) return;
          this.queue.splice(index, 1);
          reject(new PoolBusyError());
        }, this.queueTimeoutMs),
      };

      this.queue.push(job);
      this.dispatch();
    });
  }

  public async close(): Promise<void> {
    this.closed = true;
    this.rejectQueue(closedError());
    await Promise.all([...this.workers].map((worker) => this.retire(worker, closedError())));
  }

  private spawn() {
    const worker = new Worker(this.worker, this.workerOptions);
    this.workers.add(worker);
    this.starting.add(worker);

    worker.on("message", (message: WorkerMessage) => this.receive(worker, message));

    worker.on("error", (error: Error) => {
      void this.replace(worker, error);
    });

    worker.on("exit", (code) => {
      if (this.workers.has(worker)) void this.replace(worker, new Error(`A render worker exited with code ${code}`));
    });
  }

  private receive(worker: Worker, message: WorkerMessage) {
    if (message.type === "ready") {
      this.starting.delete(worker);
      this.startupFailures = 0;
      this.idle.push(worker);
      this.dispatch();
      return;
    }

    const running = this.running.get(worker);
    // A reply to a job that already timed out.
    if (!running || running.id !== message.id) return;

    clearTimeout(running.timer);
    this.running.delete(worker);

    if (message.type === "done") running.job.resolve(message.png);
    else running.job.reject(new Error(message.message));

    this.idle.push(worker);
    this.dispatch();
  }

  private dispatch() {
    while (this.idle.length > 0 && this.queue.length > 0) {
      const worker = this.idle.pop()!;
      const job = this.queue.shift()!;
      const id = this.nextId++;
      clearTimeout(job.expiry);

      const timer = setTimeout(() => {
        void this.replace(worker, new RenderTimeoutError(this.timeoutMs));
      }, this.timeoutMs);

      this.running.set(worker, { id, job, timer });

      const request: WorkerRequest = { id, ...job.request };
      worker.postMessage(request);
    }
  }

  /**
   * A worker that dies while working is replaced at once. One that dies before it's ready (it would again, if the
   * fonts are missing) is replaced after a growing delay, and after `maxStartupFailures` the pool gives up.
   */
  private async replace(worker: Worker, error: Error) {
    const diedStarting = this.starting.has(worker);
    await this.retire(worker, error);
    if (this.closed || this.broken) return;

    if (!diedStarting) {
      this.spawn();
      return;
    }

    this.startupFailures++;

    if (this.startupFailures >= this.maxStartupFailures) {
      this.broken = new Error(`Render workers keep failing to start: ${error.message}`, { cause: error });
      this.rejectQueue(this.broken);
      return;
    }

    const delay = Math.min(MAX_RESPAWN_DELAY_MS, this.respawnDelayMs * 2 ** (this.startupFailures - 1));
    setTimeout(() => {
      if (!this.closed && !this.broken) this.spawn();
    }, delay).unref();
  }

  private rejectQueue(error: Error) {
    for (const job of this.queue.splice(0)) {
      clearTimeout(job.expiry);
      job.reject(error);
    }
  }

  private async retire(worker: Worker, error: Error) {
    // `error` and `exit` both fire for a crashed worker; the second call finds it gone.
    if (!this.workers.delete(worker)) return;
    this.starting.delete(worker);

    const idleIndex = this.idle.indexOf(worker);
    if (idleIndex !== -1) this.idle.splice(idleIndex, 1);

    const running = this.running.get(worker);

    if (running) {
      clearTimeout(running.timer);
      this.running.delete(worker);
      running.job.reject(error);
    }

    await worker.terminate();
  }
}

if (import.meta.vitest) {
  const { afterEach, describe, expect, it, vi } = import.meta.vitest;

  // A worker that follows the protocol without skia-canvas; `player` carries the behavior to test.
  const STUB_WORKER = `
    const { parentPort } = require("node:worker_threads");
    parentPort.on("message", (request) => {
      const { behavior = "echo", delay = 0 } = request.player;
      if (behavior === "hang") return;
      if (behavior === "crash") throw new Error("crashed");
      setTimeout(() => {
        if (behavior === "fail") parentPort.postMessage({ type: "error", id: request.id, message: "boom" });
        else parentPort.postMessage({ type: "done", id: request.id, png: new Uint8Array([request.id]) });
      }, delay);
    });
    parentPort.postMessage({ type: "ready" });
  `;

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
    const pool = new RenderPool({ worker: STUB_WORKER, workerOptions: { eval: true }, ...options });
    pools.push(pool);
    return pool;
  };

  afterEach(async () => {
    await Promise.all(pools.splice(0).map((pool) => pool.close()));
  });

  describe("RenderPool", () => {
    it("runs jobs in order on a worker once it is ready and reports worker errors", async () => {
      const pool = create({ size: 1 });

      const [first, second] = await Promise.all([pool.render(request()), pool.render(request())]);

      expect([...first]).toEqual([0]);
      expect([...second]).toEqual([1]);
      await expect(pool.render(request({ behavior: "fail" }))).rejects.toThrow("boom");
      expect([...(await pool.render(request()))]).toEqual([3]);
    });

    it("rejects with PoolBusyError once the queue is full", async () => {
      const pool = create({ size: 1, queueLimit: 1 });
      await pool.render(request());

      const running = pool.render(request({ delay: 50 }));
      const queued = pool.render(request());
      expect(pool.pending).toBe(1);

      await expect(pool.render(request())).rejects.toBeInstanceOf(PoolBusyError);
      await expect(Promise.all([running, queued])).resolves.toHaveLength(2);
    });

    it("replaces a worker that hangs past the timeout", async () => {
      const pool = create({ size: 1, timeoutMs: 50 });
      // The 50 ms also covers the first render, which can take longer on a busy machine.
      const [warm] = await vi.waitFor(() => pool.render(request()), { timeout: 5000 });

      await expect(pool.render(request({ behavior: "hang" }))).rejects.toBeInstanceOf(RenderTimeoutError);
      expect([...(await pool.render(request()))]).toEqual([warm + 2]);
    });

    it("rejects a job that waits past the queue deadline", async () => {
      const pool = create({ size: 1, queueTimeoutMs: 50 });
      // The deadline also covers waiting for the worker to start, which can take longer on a busy machine.
      await vi.waitFor(() => pool.render(request()), { timeout: 5000 });

      const running = pool.render(request({ delay: 200 }));
      await expect(pool.render(request())).rejects.toBeInstanceOf(PoolBusyError);
      await expect(running).resolves.toBeDefined();
    });

    it("stops replacing workers that die before they are ready", async () => {
      const pool = create({ worker: "throw new Error('no fonts')", size: 1, respawnDelayMs: 1, maxStartupFailures: 3 });

      await expect(pool.render(request())).rejects.toThrow("Render workers keep failing to start: no fonts");
      await expect(pool.render(request())).rejects.toThrow("keep failing");
    });

    it("replaces a worker that crashes", async () => {
      const pool = create({ size: 1 });
      await pool.render(request());

      await expect(pool.render(request({ behavior: "crash" }))).rejects.toThrow("crashed");
      expect([...(await pool.render(request()))]).toEqual([2]);
    });
  });
}
