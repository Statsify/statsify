/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { MongoModule } from "#mongo";
import { Module, forwardRef } from "@nestjs/common";
import { PlayerSchema, UserSchema } from "@statsify/schemas";
import { PlayerModule } from "#player";
import { Session } from "./session.model.js";
import { SessionController } from "./session.controller.js";
import { SessionService } from "./session.service.js";

@Module({
  imports: [
    forwardRef(() => PlayerModule),
    MongoModule.forFeature([Session, PlayerSchema, UserSchema]),
  ],
  controllers: [SessionController],
  providers: [SessionService],
})
export class SessionModule {}
