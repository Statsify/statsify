/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import * as Sentry from "@sentry/node";
import { Guild, Player } from "@statsify/schemas";
import { AccountController } from "./account.controller.js";
import { AccountModule } from "./account.module.js";
import { GuildModule } from "#guild";
import { Module } from "@nestjs/common";
import { ORPCError, ORPCModule, onError } from "@orpc/nest";
import { PlayerModule } from "#player";
import { Session } from "#session";
import { SiteController } from "./site.controller.js";
import { SiteService } from "./site.service.js";
import { TypegooseModule } from "@m8a/nestjs-typegoose";

@Module({
  imports: [
    GuildModule,
    PlayerModule,
    AccountModule,
    TypegooseModule.forFeature([Player, Guild, Session]),
    // oRPC answers errors itself, so the global `SentryInterceptor` never sees them. Contract errors
    // (404, 429) are expected; anything else is a bug and gets reported like the REST routes' errors.
    ORPCModule.forRoot({
      interceptors: [
        onError((error) => {
          if (error instanceof ORPCError && error.status < 500) return;
          Sentry.captureException(error);
        }),
      ],
    }),
  ],
  controllers: [SiteController, AccountController],
  providers: [SiteService],
})
export class SiteModule {}
