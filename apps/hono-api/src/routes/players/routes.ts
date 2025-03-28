/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Permissions, Policy, auth } from "#middleware/auth";
import { PlayerSlugSchema } from "#middleware/validation";
import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";

const PlayerReadOrManage = Policy.some(Policy.has(Permissions.PlayerRead), Policy.has(Permissions.PlayerManage));

export const get = createRoute({
  method: "get",
  path: "/",
  middleware: [auth({ policy: PlayerReadOrManage })],
  request: { query: z.object({ player: PlayerSlugSchema }) },
  responses: {
    200: {
      description: "Retreive the player",
      content: { "application/json": { schema: z.object({ success: z.boolean(), player: z.object({ uuid: z.string() }) }) } },
    },
  },
});
