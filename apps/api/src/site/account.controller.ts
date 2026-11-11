/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { AccountService } from "./account.service.js";
import { ApiExcludeController } from "@nestjs/swagger";
import { Auth } from "#auth";
import { Controller } from "@nestjs/common";
import { Implement, implement } from "@orpc/nest";
import { SITE_ONLY } from "./site.controller.js";
import { contract } from "@statsify/contract";

@Controller("/rpc")
@ApiExcludeController()
export class AccountController {
  public constructor(private readonly accountService: AccountService) {}

  @Auth(SITE_ONLY)
  @Implement(contract.account.login)
  public login() {
    return implement(contract.account.login).handler(({ input }) => this.accountService.login(input.code, input.redirectUri));
  }

  @Auth(SITE_ONLY)
  @Implement(contract.account.logout)
  public logout() {
    return implement(contract.account.logout).handler(({ input }) => this.accountService.logout(input.session));
  }

  @Auth(SITE_ONLY)
  @Implement(contract.account.get)
  public get() {
    return implement(contract.account.get).handler(({ input }) => this.accountService.get(input.session));
  }

  @Auth(SITE_ONLY)
  @Implement(contract.account.claimVerified)
  public claimVerified() {
    return implement(contract.account.claimVerified).handler(({ input }) => this.accountService.claimVerified(input.session));
  }

  @Auth(SITE_ONLY)
  @Implement(contract.account.setPrimary)
  public setPrimary() {
    return implement(contract.account.setPrimary).handler(({ input }) =>
      this.accountService.setPrimary(input.session, input.uuid)
    );
  }

  @Auth(SITE_ONLY)
  @Implement(contract.account.unlink)
  public unlink() {
    return implement(contract.account.unlink).handler(({ input }) => this.accountService.unlink(input.session, input.uuid));
  }

  @Auth(SITE_ONLY)
  @Implement(contract.account.dismissMoved)
  public dismissMoved() {
    return implement(contract.account.dismissMoved).handler(({ input }) => this.accountService.dismissMoved(input.session));
  }
}
