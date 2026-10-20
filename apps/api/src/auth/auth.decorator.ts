/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiSecurity } from "@nestjs/swagger";
import { AuthGuard } from "./auth.guard.js";
import { AuthRole } from "./auth.role.js";
import { SetMetadata, UseGuards, applyDecorators } from "@nestjs/common";

export interface AuthDecoratorOptions {
  /**
   * @description The required weight for the request, for example if the route adds more than a single api request limit
   */
  weight?: number;

  /**
   * @description The required roles for the request
   */
  role?: AuthRole;

  /**
   * @description Requests made with the website's key (`AuthRole.SITE`) skip the weighted limit on this route. The
   * site's edge rate limit and its Hypixel budget bound them instead; every other route still limits that key.
   */
  siteUnlimited?: boolean;
}

export function Auth({ weight = 1, role = AuthRole.MEMBER, siteUnlimited = false }: AuthDecoratorOptions = {}) {
  return applyDecorators(
    SetMetadata("auth-weight", weight),
    SetMetadata("auth-role", role),
    SetMetadata("auth-site-unlimited", siteUnlimited),
    UseGuards(AuthGuard),
    ApiSecurity("ApiKey")
  );
}
