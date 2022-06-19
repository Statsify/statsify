/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Command, CommandContext, PaginateService } from "@statsify/discord";

@Command({ description: "Hello" })
export class TestCommand {
  public constructor(private readonly paginateService: PaginateService) {}

  public run(context: CommandContext) {
    return this.paginateService.scrollingPagination(context, [
      () => ({
        content: "Hello",
      }),
      () => ({
        content: "Bye",
      }),
      () => ({
        content: "EEE",
      }),
    ]);
  }
}
