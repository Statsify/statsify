/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Auth, AuthRole } from "../auth";
import { CommandDto } from "../dtos";
import { CommandsService } from "./commands.service";
import { Controller, Get, Patch, Query } from "@nestjs/common";

@Controller("/commands")
@ApiTags("Commands")
export class CommandsController {
  public constructor(private readonly commandService: CommandsService) {}

  @Get()
  @ApiOperation({ summary: "Get Command Usage" })
  @Auth({ role: AuthRole.ADMIN })
  public async getCommandUsage() {
    const usage = await this.commandService.getCommandUsage();

    return {
      success: true,
      usage,
    };
  }

  @Patch()
  @ApiOperation({ summary: "Increment Command Usage" })
  @Auth({ role: AuthRole.ADMIN })
  public async patchCommandRun(@Query() { command }: CommandDto) {
    await this.commandService.incrementCommandRun(command);

    return { success: true };
  }
}
