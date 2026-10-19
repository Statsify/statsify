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

export async function GET(
  request: NextRequest
) {
  const searchParams = request.nextUrl.searchParams;
  const query = SkinUuid.safeParse(searchParams.get("uuid"));
  if (!query.success) return new Response("Invalid uuid", { status: 400 });

  const uuid = query.data;
  return fetch(`${env.API_URL}/skin?uuid=${uuid}`, { headers: { "X-API-KEY": env.API_KEY } });
}
