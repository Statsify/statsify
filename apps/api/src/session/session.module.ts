/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Module, forwardRef } from "@nestjs/common";
import { Player } from "@statsify/schemas";
import { PlayerModule } from "#player";
import { Session } from "./session.model.js";
import { SessionController } from "./session.controller.js";
import { SessionService } from "./session.service.js";
import { TypegooseModule } from "@m8a/nestjs-typegoose";

@Module({
  imports: [
    forwardRef(() => PlayerModule),
    TypegooseModule.forFeature([
      Session,
      Player,
    ]),
  ],
  controllers: [SessionController],
  providers: [SessionService],
})
export class SessionModule {}
