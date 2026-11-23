/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { contract } from "../src/contract.ts";
import { join } from "node:path";
import { minifyContractRouter } from "@orpc/contract";
import { mkdirSync, writeFileSync } from "node:fs";

/**
 * The contract without its schemas, for the browser's `OpenAPILink`: routes and error codes are all it needs, so
 * the site's client bundle doesn't carry every procedure's zod schema.
 */
const dist = join(import.meta.dirname, "..", "dist");
mkdirSync(dist, { recursive: true });
writeFileSync(join(dist, "contract.min.json"), JSON.stringify(minifyContractRouter(contract)));
