/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import z from "zod";
import { procedure, router } from "#routing";
import type { Constructor } from "@statsify/util";

export function createAutocompleteRouter<T>(constructor: Constructor<T>) {
  return router({
    search: procedure
      .input(z.string())
      .query(({ ctx, input }) => ctx.redis
        .call("FT.SUGGET", `${constructor.name}:autocomplete`, input, "FUZZY", "MAX", "25")
        .catch((error) => {
          if (error instanceof Error && error.message.startsWith("ERR unknown command 'FT.SUGGET'")) {
            ctx.logger.warn("Autocomplete failed because RediSearch is not installed.");
          } else {
            ctx.logger.error(error);
          }

          return [];
        }) as Promise<string[]>
      ),
  });
}
