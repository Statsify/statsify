/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { AuthController } from "./auth.controller.js";
import { AuthGuard } from "./auth.guard.js";
import { AuthService } from "./auth.service.js";
import { Global, Module } from "@nestjs/common";

@Global()
@Module({
  providers: [AuthGuard, AuthService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
