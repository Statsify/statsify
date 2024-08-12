/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { logging } from "#middleware/logger";
import { sentry } from "#middleware/sentry";
import { t } from "#trpc";

export const router = t.router;

export const procedure = t.procedure
  .use(logging)
  .use(sentry);