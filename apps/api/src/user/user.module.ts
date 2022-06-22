/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Module } from "@nestjs/common";
import { TypegooseModule } from "@m8a/nestjs-typegoose";
import { User, VerifyCode } from "@statsify/schemas";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";

@Module({
  imports: [TypegooseModule.forFeature([User, VerifyCode])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
