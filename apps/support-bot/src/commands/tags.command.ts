/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { APIAttachment } from "discord-api-types/v10";
import {
  Command,
  CommandContext,
  EmbedBuilder,
  ErrorMessage,
  FileArgument,
  IMessage,
  SubCommand,
  TextArgument,
} from "@statsify/discord";
import { STATUS_COLORS } from "@statsify/logger";
import { TagService } from "#services";
import { UserTier } from "@statsify/schemas";

@Command({ description: (t) => t("commands.tags"), userCommand: false })
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
  public async create(context: CommandContext): Promise<IMessage> {
    const name = context.option<string>("name");
    const content = context.option<string>("content").replaceAll("\\n", "\n");
    const attachment = context.option<APIAttachment | null>("attachment");

    if (
      attachment &&
      !["image/png", "image/jpeg", "image/gif"].includes(attachment.content_type ?? "")
    )
      throw new ErrorMessage(
        (t) => t("errors.unsupportedFileType.title"),
        (t) => t("errors.unsupportedFileType.description")
      );

    const command = await this.tagService.create(name, content, attachment?.url);

    return command.execute(context);
  }

  @SubCommand({
    description: (t) => t("commands.tags-delete"),
    args: [new TextArgument("name", (t) => t("arguments.tags-name"), true)],
    tier: UserTier.STAFF,
  })
  public async delete(context: CommandContext): Promise<IMessage> {
    const name = context.option<string>("name");
    await this.tagService.delete(name);

    const embed = new EmbedBuilder()
      .color(STATUS_COLORS.success)
      .title((t) => t("embeds.tags.deleted.title"))
      .description((t) => t("embeds.tags.deleted.description", { tag: name }));

    return { embeds: [embed] };
  }

  @SubCommand({
    description: (t) => t("commands.tags-rename"),
    args: [
      new TextArgument("original", (t) => t("arguments.tags-name"), true),
      new TextArgument("new", (t) => t("arguments.tags-name"), true),
    ],
    tier: UserTier.STAFF,
  })
  public async rename(context: CommandContext): Promise<IMessage> {
    const originalName = context.option<string>("original");
    const newName = context.option<string>("new");

    await this.tagService.rename(originalName, newName);

    const embed = new EmbedBuilder()
      .color(STATUS_COLORS.success)
      .title((t) => t("embeds.tags.rename.title"))
      .description((t) => t("embeds.tags.rename.description", { originalName, newName }));

    return { embeds: [embed] };
  }
}
