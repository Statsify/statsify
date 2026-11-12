/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Account, AccountProfile, Player, User } from "@statsify/schemas";
import { AccountService } from "./account.service.js";
import { Module } from "@nestjs/common";
import { TypegooseModule } from "@m8a/nestjs-typegoose";

/** Apart from `SiteModule`, so `UserModule` can use it without the rest of the site. */
@Module({
  imports: [TypegooseModule.forFeature([Account, AccountProfile, User, Player])],
  providers: [AccountService],
  exports: [AccountService],
})
export class AccountModule {}
