/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { procedure, router } from "#routing";
import { z } from "zod";

export function createAutocompleteRouter() {
  return router({
    search: procedure
      .input(z.object({ query: z.string() }))
      .query(() => []),
  });
}
