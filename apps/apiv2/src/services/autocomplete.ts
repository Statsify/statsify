/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import z from "zod";
import { Context } from "#trpc";
import { procedure, router } from "#routing";
import type { Constructor } from "@statsify/util";

export function createAutocompleteRouter<T>(constructor: Constructor<T>) {
  return router({
    search: procedure
      .input(z.string())
      .query(({ ctx, input }) => ctx.redis
        .call("FT.SUGGET", `${constructor.name}:autocomplete`, input, "FUZZY", "MAX", "25")
        .catch((error) => {
          handleAutocompleteError(error, ctx.logger);
          return [];
        }) as Promise<string[]>
      ),
  });
}

export async function addAutocompleteEntry<T>(ctx: Context, constructor: Constructor<T>, entry: string) {
  try {
    await ctx.redis.call(
      "FT.SUGADD",
      `${constructor.name}:autocomplete`,
      entry,
      "1",
      "INCR"
    );
  } catch (error) {
    handleAutocompleteError(ctx, error);
  }
}

function handleAutocompleteError(ctx: Context, error: unknown) {
  if (error instanceof Error && error.message.startsWith("ERR unknown command 'FT.SUGGET'")) {
    ctx.logger.warn("Autocomplete failed because RediSearch is not installed.");
  } else {
    ctx.logger.error(error);
  }
}
