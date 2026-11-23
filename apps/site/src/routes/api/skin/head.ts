/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { createFileRoute } from "@tanstack/react-router";
import { proxySkin } from "~/server/skin.server";

export const Route = createFileRoute("/api/skin/head")({
  server: {
    handlers: {
      // Pages get the 8×8 face and `SkinHead` scales it, so a player's head is one cached image at every size. Tab
      // icons ask for 32, because browsers smooth a favicon when they scale it.
      GET: ({ request }) => {
        const search = new URL(request.url).searchParams;
        return proxySkin("/skin/head", search, { size: search.get("size") === "32" ? "32" : "8" });
      },
    },
  },
});
