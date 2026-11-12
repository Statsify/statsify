/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { AutocompleteController } from "./autocomplete.controller.js";
import { AutocompleteService } from "./autocomplete.service.js";
import { Guild, Player, User } from "@statsify/schemas";
import { GuildModule } from "#guild";
import { Module } from "@nestjs/common";
import { PlayerModule } from "#player";
import { TypegooseModule } from "@m8a/nestjs-typegoose";

@Module({
  imports: [GuildModule, PlayerModule, TypegooseModule.forFeature([Guild, Player, User])],
  controllers: [AutocompleteController],
  providers: [AutocompleteService],
})
export class AutocompleteModule {}
