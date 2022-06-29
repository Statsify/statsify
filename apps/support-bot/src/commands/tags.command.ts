/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  Command,
  CommandContext,
  FileArgument,
  SubCommand,
  TextArgument,
} from "@statsify/discord";
import { UserTier } from "@statsify/schemas";

const TAG_NAME_REGEX = /^[\w-]{1,32}$/;
import { TagService } from "#services";

@Command({ description: (t) => t("commands.tags") })
export class TagsCommand {
  public constructor(private readonly tagService: TagService) {}

  @SubCommand({
    description: (t) => t("commands.tags-create"),
    args: [
      new TextArgument("name", (t) => t("arguments.tags-name"), true),
      new TextArgument("content", (t) => t("arguments.tags-content"), true),
      new FileArgument("attachment"),
    ],
    tier: UserTier.STAFF,
  })
  public async create(context: CommandContext) {
    this.tagService.create(
      context.option("name"),
      context.option("content"),
      context.option("attachment")
    );
  }

  @SubCommand({
    description: (t) => t("commands.tags-delete"),
    args: [new TextArgument("name", (t) => t("arguments.tags-name"), true)],
    tier: UserTier.STAFF,
  })
  public async delete(context: CommandContext) {
    this.tagService.delete(context.option("name"));
  }

  @SubCommand({
    description: (t) => t("commands.tags-rename"),
    args: [
      new TextArgument("original", (t) => t("arguments.tags-name"), true),
      new TextArgument("new", (t) => t("arguments.tags-name"), true),
    ],
    tier: UserTier.STAFF,
  })
  public async rename(context: CommandContext) {
    this.tagService.rename(context.option("original"), context.option("new"));
  }
}
