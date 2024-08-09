/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import z from "zod";
import { Caching, GuildInput } from "../validation.js";
import { Guild } from "@statsify/schemas";
import { procedure, router } from "../routing.js";

export const guildsRouter = router({
  get: procedure
    .input(z.intersection(GuildInput, z.object({ caching: Caching })))
    .query(({ ctx, input }) => {
      const guild = new Guild();

      return { guild };
    }),

  delete: procedure
    .input(GuildInput)
    .mutation(() => ({ players: [] })),
});
