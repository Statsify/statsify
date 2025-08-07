/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { z } from "zod";

const Environment = z.object({
  API_KEY: z.string(),
  API_URL: z.string().default("https://api.statsify.net"),
  ENVIRONMENT: z.enum(["development", "production"]).default("production"),
});

export const env = Environment.parse(process.env);
