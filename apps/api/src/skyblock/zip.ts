/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { gunzip, gzip } from "node:zlib";
import { promisify } from "node:util";

// The async zlib calls keep a big co-op's response off the event loop.
const gzipAsync = promisify(gzip);
const gunzipAsync = promisify(gunzip);

export const gzipJson = (value: unknown) => gzipAsync(JSON.stringify(value));

export const gunzipJson = async <T>(data: Buffer) =>
  JSON.parse((await gunzipAsync(data)).toString()) as T;
