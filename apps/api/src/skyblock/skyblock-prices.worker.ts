/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

// Decoding about 45,000 auctions here keeps the API's event loop free.
import { gzipSync } from "node:zlib";
import { parentPort } from "node:worker_threads";
import {
  type Bazaar,
  type ItemsResource,
  type RawAuctionsPage,
  type SeenIndex,
  buildPriceMap,
} from "@statsify/skyblock";

export interface RebuildRequest {
  timeout: number;
  bazaar: Bazaar;
  items: ItemsResource;
}

export type RebuildResult =
  | { data: Uint8Array; asOf: number }
  | { error: string };

const AUCTIONS_URL = "https://api.hypixel.net/v2/skyblock/auctions";
const PAGES_IN_FLIGHT = 4;

let seen: SeenIndex | undefined;

async function getPage(page: number, timeout: number) {
  const response = await fetch(`${AUCTIONS_URL}?page=${page}`, {
    signal: AbortSignal.timeout(timeout),
  });
  if (!response.ok) {
    throw new Error(`auctions page ${page} answered ${response.status}`);
  }

  return (await response.json()) as RawAuctionsPage;
}

async function* getPages(timeout: number): AsyncGenerator<RawAuctionsPage> {
  const first = await getPage(0, timeout);
  yield first;

  for (let start = 1; start < first.totalPages; start += PAGES_IN_FLIGHT) {
    const count = Math.min(PAGES_IN_FLIGHT, first.totalPages - start);
    const pages = Array.from({ length: count }, (_, i) =>
      getPage(start + i, timeout),
    );
    // oxlint-disable-next-line no-await-in-loop -- each batch is decoded before the next is fetched
    yield* await Promise.all(pages);
  }
}

parentPort?.on(
  "message",
  async ({ timeout, bazaar, items }: RebuildRequest) => {
    try {
      const built = await buildPriceMap(getPages(timeout), bazaar, items, seen);
      seen = built.seen;

      const data = gzipSync(JSON.stringify(built.map));
      const result: RebuildResult = { data, asOf: built.map.asOf };
      parentPort?.postMessage(result);
    } catch (error) {
      const result: RebuildResult = { error: String(error) };
      parentPort?.postMessage(result);
    }
  },
);
