/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

// The price rebuild's thread, so decoding ~45K auctions never blocks the API's event loop.
import { gzipSync } from "node:zlib";
import { parentPort } from "node:worker_threads";
import { type Bazaar, type ItemsResource, type RawAuctionsPage, type SeenIndex, buildPriceMap } from "@statsify/skyblock";

export interface RebuildRequest {
  timeout: number;
  bazaar: Bazaar;
  items: ItemsResource;
}

export type RebuildResult = { data: Uint8Array; asOf: number } | { error: string };

const AUCTIONS_URL = "https://api.hypixel.net/v2/skyblock/auctions";
const PAGES_IN_FLIGHT = 4;

let seen: SeenIndex | undefined;

async function getPage(page: number, timeout: number): Promise<RawAuctionsPage> {
  const response = await fetch(`${AUCTIONS_URL}?page=${page}`, { signal: AbortSignal.timeout(timeout) });
  if (!response.ok) throw new Error(`auctions page ${page} answered ${response.status}`);
  return response.json() as Promise<RawAuctionsPage>;
}

async function* getPages(timeout: number): AsyncGenerator<RawAuctionsPage> {
  const first = await getPage(0, timeout);
  yield first;

  for (let start = 1; start < first.totalPages; start += PAGES_IN_FLIGHT) {
    const count = Math.min(PAGES_IN_FLIGHT, first.totalPages - start);
    // oxlint-disable-next-line no-await-in-loop -- each batch is decoded before the next is fetched
    yield* await Promise.all(Array.from({ length: count }, (_, i) => getPage(start + i, timeout)));
  }
}

parentPort?.on("message", async ({ timeout, bazaar, items }: RebuildRequest) => {
  try {
    const built = await buildPriceMap(getPages(timeout), bazaar, items, seen);
    seen = built.seen;

    const result: RebuildResult = { data: gzipSync(JSON.stringify(built.map)), asOf: built.map.asOf };
    parentPort?.postMessage(result);
  } catch (error) {
    parentPort?.postMessage({ error: String(error) } satisfies RebuildResult);
  }
});
