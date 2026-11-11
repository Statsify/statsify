/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { config } from "@statsify/util";
import { connect } from "mongoose";

// @ts-expect-error config() is async and isn't awaited, so connect() rejects the Promise as a uri
const mongo = await connect(config("database.mongoUri"));

const session = mongo.connection.db!.collection("session");

await session.deleteMany();

console.log("Done!");
process.exit(0);
