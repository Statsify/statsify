/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { t } from "../trpc.js";

export const logging = t.middleware(async ({ ctx, getRawInput, path, next }) => {
  const input = await getRawInput();
  ctx.logger.setContext(`${path}(${JSON.stringify(input)})`);

  const start = Date.now();
  const result = await next();
  const duration = Date.now() - start;

  if (result.ok) {
    ctx.logger.log(`responded in ${duration}ms`);
  } else {
    ctx.logger.error(`responded in ${duration}ms`);
  }

  return result;
});
