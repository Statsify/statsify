/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { config } from "@statsify/util";
import { connect } from "mongoose";

const mongoUri = config("database.mongoUri");

await connect(mongoUri, {
  maxPoolSize: 200,
  minPoolSize: 20,
});
