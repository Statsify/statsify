/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import assert from "node:assert";
import { ApiException } from "./exception.js";
import { config } from "@statsify/util";
import { createHash } from "node:crypto";
import { createMiddleware } from "hono/factory";

const MissingApiKeyException = new ApiException(400, ["Missing 'X-API-Key' header or 'key' query"]);

const ignoreAuth = config("api.ignoreAuth", { required: false });

export type AuthOptions = {
  weight?: number;
};

export function auth({ weight = 1 }: AuthOptions) {
  assert(weight >= 1, "Auth weight should be greater than 0");

  return createMiddleware(async (c, next) => {
    if (ignoreAuth) {
      await next();
      return;
    }

    const role = this.reflector.get<AuthRole>("auth-role", handler);

    const apiKey = c.req.header("X-API-Key") ?? c.req.query("key");
    if (!apiKey) throw MissingApiKeyException;

    const keyInfo = await this.authService.limited(apiKey, weight, role);

    c.header("X-Ratelimit-Used", keyInfo.used);
    c.header("X-Ratelimit-Total", keyInfo.limit);
    c.header("X-Ratelimit-Timeout", keyInfo.resetTime);

    await next();
  });
}

const hash = (apiKey: string) => createHash("sha256")
  .update(apiKey)
  .digest("hex");
