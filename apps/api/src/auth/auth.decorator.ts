/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
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
}

export function Auth({ weight = 1, role = AuthRole.MEMBER }: AuthDecoratorOptions = {}) {
  return applyDecorators(
    SetMetadata("auth-weight", weight),
    SetMetadata("auth-role", role),
    UseGuards(AuthGuard),
    ApiSecurity("ApiKey")
  );
}
