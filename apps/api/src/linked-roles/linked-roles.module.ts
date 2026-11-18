/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { LinkedRolesController } from "./linked-roles.controller.js";
import { LinkedRolesService } from "./linked-roles.service.js";
import { Module, forwardRef } from "@nestjs/common";
import { PlayerModule } from "#player";
import { RoleConnection, User } from "@statsify/schemas";
import { TypegooseModule } from "@m8a/nestjs-typegoose";

@Module({
  imports: [
    forwardRef(() => PlayerModule),
    TypegooseModule.forFeature([RoleConnection, User]),
  ],
  controllers: [LinkedRolesController],
  providers: [LinkedRolesService],
  exports: [LinkedRolesService],
})
export class LinkedRolesModule {}
