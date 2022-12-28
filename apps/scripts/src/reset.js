/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { config } from "@statsify/util";
import { connect } from "mongoose";

const mongo = await connect(config("database.mongoUri"));

const daily = mongo.connection.db.collection("daily");
const weekly = mongo.connection.db.collection("weekly");
const monthly = mongo.connection.db.collection("monthly");

await daily.updateMany({}, { $unset: { lastReset: 1, nextReset: 1 } });
await weekly.updateMany({}, { $unset: { lastReset: 1, nextReset: 1 } });
await monthly.updateMany({}, { $unset: { lastReset: 1, nextReset: 1 } });

console.log("Done!");
