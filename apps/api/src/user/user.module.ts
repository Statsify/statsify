/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { MongoModule } from "#mongo";
import { Module } from "@nestjs/common";
import { UserSchema, VerifyCodeSchema } from "@statsify/schemas";
import { UserController } from "./user.controller.js";
import { UserService } from "./user.service.js";

@Module({
  imports: [MongoModule.forFeature([UserSchema, VerifyCodeSchema])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
