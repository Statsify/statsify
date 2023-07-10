/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { AppController } from "./app.controller.js";
import { AuthModule } from "#auth";
import { CommandsModule } from "#commands";
import { GuildModule } from "#guild";
import { HistoricalModule } from "#historical";
import { HypixelResourcesModule } from "#hypixel-resources";
import { Module } from "@nestjs/common";
import { PlayerModule } from "#player";
import { RedisModule } from "#redis";
import { SkinModule } from "#skin";
import { TypegooseModule } from "@m8a/nestjs-typegoose";
import { UserModule } from "#user";
import { config } from "@statsify/util";

@Module({
  imports: [
    TypegooseModule.forRootAsync({
      useFactory: () => ({
        uri: config("database.mongoUri"),
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 200,
        minPoolSize: 20,
      }),
    }),
    RedisModule.forRoot({
      config: {
        url: config("database.redisUrl"),
      },
    }),
    PlayerModule,
    GuildModule,
    HypixelResourcesModule,
    SkinModule,
    HistoricalModule,
    AuthModule,
    UserModule,
    CommandsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
