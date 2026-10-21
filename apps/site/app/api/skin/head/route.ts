/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import type { NextRequest } from "next/server";
import { SkinUuid } from "~/app/api/skin/uuid";
import { env } from "~/app/env";
import { z } from "zod";

const HeadQuery = z.object({
  uuid: SkinUuid,
  size: z.coerce.number().int().min(8).max(800).default(160),
});

export async function GET(
  request: NextRequest
) {
  const searchParams = request.nextUrl.searchParams;

  const query = HeadQuery.safeParse({
    uuid: searchParams.get("uuid"),
    size: searchParams.get("size") ?? undefined,
  });

  if (!query.success) return new Response("Invalid uuid or size", { status: 400 });

  const { uuid, size } = query.data;
  return fetch(`${env.API_URL}/skin/head?uuid=${uuid}&size=${size}`, {
    headers: { "X-API-KEY": env.API_KEY },
  });
}
