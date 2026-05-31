/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiService, CacheLevel } from "@statsify/api-client";
import { Logger } from "@statsify/logger";
import { Player } from "@statsify/schemas";
import { config } from "@statsify/util";
import { connect } from "mongoose";

const logger = new Logger("Hypixel Sweeper");

const mongoUri = await config("database.mongoUri");
const mongo = await connect(mongoUri);
const players = mongo.connection.db.collection(`${Player.name.toLowerCase()}s`);

const requestsPerMinute = await config("sweeper.requestsPerMinute", { default: 100 });
const batchSize = await config("sweeper.batchSize", { default: 10_000 });
const staleAfterDays = await config("sweeper.staleAfterDays", { default: 7 });
const penaltyMs = await config("sweeper.penaltyMs", { default: 86_400_000 });

const apiKey = await config("apiClient.key");
const apiRoute = await config("apiClient.route");
const api = new ApiService(apiRoute, apiKey);

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const sweep = async () => {
  const staleThreshold = Date.now() - staleAfterDays * 24 * 60 * 60 * 1000;

  const stalePlayers = await players
    .find({ expiresAt: { $lt: staleThreshold } }, { projection: { uuid: 1, _id: 0 } })
    .sort({ expiresAt: 1 })
    .limit(batchSize)
    .toArray();

  logger.log(`Found ${stalePlayers.length} stale players to refresh`);

  const interval = 60_000 / requestsPerMinute;
  let refreshed = 0;
  let errored = 0;
  const start = Date.now();

  for (const { uuid } of stalePlayers) {
    try {
      await api.getCachedPlayer(uuid, CacheLevel.LIVE);
      refreshed++;
    } catch {
      errored++;
      await players.updateOne({ uuid }, { $set: { expiresAt: Date.now() + penaltyMs } });
    }
    await delay(interval);
  }

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  logger.log(`Sweep complete in ${elapsed}s — refreshed: ${refreshed}, errored: ${errored}`);
};

while (true) {
  await sweep();
  await delay(60_000);
}
