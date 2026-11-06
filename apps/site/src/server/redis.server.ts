/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { onShutdown, shuttingDown } from "./shutdown.server";
import { Redis } from "ioredis";
import { setTimeout as sleep } from "node:timers/promises";
import { siteConfig } from "./config.server";

let client: Redis | undefined;

/**
 * One connection per process to the API's Redis (`database.redisUrl`), opened on first use so builds
 * and tests never connect. The site keeps only its unfurl image cache and render locks there.
 */
export async function redis(): Promise<Redis> {
  if (shuttingDown()) throw new Error("The site is shutting down");

  if (!client) {
    const { redisUrl } = await siteConfig();
    client ??= connect(redisUrl);
  }

  return client;
}

function connect(redisUrl: string): Redis {
  const connection = new Redis(redisUrl, { maxRetriesPerRequest: 2 });
  onShutdown(() => disconnect(connection));
  return connection;
}

/** `QUIT`, or drops the socket if Redis hasn't answered within half a second. The wait never holds the process. */
async function disconnect(connection: Redis) {
  await Promise.race([connection.quit(), sleep(500, undefined, { ref: false })]).catch(() => undefined);
  connection.disconnect();
}
