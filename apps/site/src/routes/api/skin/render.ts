/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { createFileRoute } from "@tanstack/react-router";
import { proxySkin } from "~/server/skin.server";

export const Route = createFileRoute("/api/skin/render")({
  server: {
    handlers: {
      GET: ({ request }) => proxySkin("/skin", new URL(request.url).searchParams),
    },
  },
});
