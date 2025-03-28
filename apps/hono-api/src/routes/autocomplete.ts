/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Hono } from "hono";
import { Permissions, Policy, type Predicate, auth } from "#middleware/auth";
import { openapi } from "#middleware/openapi";
import { redis } from "#db/redis";
import { validator } from "#middleware/validation";
import { z } from "zod";
import type { ChainableCommander } from "ioredis";
import type { Constructor } from "@statsify/util";

export type AutocompleteServiceOptions<T> = {
  constructor: Constructor<T>;
  querySchema: z.ZodSchema<string>;
  policy?: Predicate;
};

let loggedRediSearchInstallationError = false;

export function onRediSearchError(error: unknown) {
  if (error instanceof Error && error.message.includes("unknown command")) {
    if (!loggedRediSearchInstallationError) {
      console.error("Autocomplete failed because RediSearch is not installed.");
      loggedRediSearchInstallationError = true;
    }
  } else {
    console.error(error);
  }
}

export function createAutocompleteService<T>({ constructor, querySchema, policy }: AutocompleteServiceOptions<T>) {
  const name = constructor.name.toLowerCase();
  const key = `${name}:autocomplete`;

  function addAutocomplete(pipeline: ChainableCommander, username: string) {
    // Don't add names less than 3 characters
    if (username.length < 3) return;

    pipeline.call(
      "FT.SUGADD",
      key,
      username,
      "1",
      "INCR"
    );
  }

  function removeAutocomplete(pipeline: ChainableCommander, username: string) {
    pipeline.call("FT.SUGDEL", key, username);
  }

  const router = new Hono()
    .get(
      "/",
      openapi({
        tags: ["Autocomplete"],
        operationId: `get${constructor.name}Autocomplete`,
        summary: `Get ${constructor.name} Autocomplete`,
      }),
      auth({ policy: Policy.all(Policy.has(Permissions.AutocompleteRead), policy) }),
      validator("query", z.object({ query: querySchema })),
      async (c) => {
        const { query } = c.req.valid("query");

        try {
          const results = await redis.call(
            "FT.SUGGET",
            key,
            query,
            "FUZZY",
            "MAX",
            "25"
          ) as string[];

          return c.json({ success: true, results });
        } catch (error) {
          onRediSearchError(error);
          return c.json({ success: false, issues: ["Failed to search autocomplete"] }, 500);
        }
      });

  return { router, addAutocomplete, removeAutocomplete };
}
