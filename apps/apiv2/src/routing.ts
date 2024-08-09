/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { logging } from "./middleware/logger.js";
import { t } from "./trpc.js";

export const router = t.router;
export const procedure = t.procedure.use(logging);
