/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { APIAttachment } from "discord-api-types/v10";
import {
  CommandContext,
  CommandPoster,
  CommandResolvable,
  EmbedBuilder,
  IMessage,
  UserArgument,
} from "@statsify/discord";
import { CommandListener } from "#lib/command.listener";
import { CommandMetadata } from "@statsify/discord/src/command/command.interface";
import { Inject, Service } from "typedi";
import { ReturnModelType } from "@typegoose/typegoose";
import { STATUS_COLORS } from "@statsify/logger";
import { Tag } from "@statsify/schemas";
import { env } from "@statsify/util";

const TAG_NAME_REGEX = /^[\w-]{1,32}$/;

@Service()
export class TagService {
  public constructor(
    private readonly commandPoster: CommandPoster,
    @Inject(() => Tag) private readonly tagModel: ReturnModelType<typeof Tag>
  ) {}

  public async fetch() {
    const tags = await this.tagModel.find().lean().exec();
    const commands = tags.map(this.createCommand);
    return commands;
  }

  public async create(name: string, content: string, attachment: APIAttachment | null) {
    this.validateName(name);

    const tag = { name, content, attachment: attachment?.url }

    const command = this.createCommand(tag);

    const listener = CommandListener.getInstance();
    listener.addCommand(command);

    const { id } = await this.commandPoster.post(
      command,
      env("SUPPORT_BOT_APPLICATION_ID"),
      env("SUPPORT_BOT_GUILD")
    );

    await this.tagModel.replaceOne({ name }, {id,...tag}, { upsert: true }).lean().exec();
  }

  public createCommand(tag: Omit<Tag, "id">) {
    const metadata: CommandMetadata = {
      name: tag.name,
      description: "A tag",
      methodName: "run",
      args: [new UserArgument("user", false)],
      cooldown: 0,
    };

    const target = {
      run(context: CommandContext) {
        const user = context.option<string | null>("user");

        const embed = new EmbedBuilder()
          .color(STATUS_COLORS.info)
          .description(tag.content);

        if (tag.attachment) embed.image(tag.attachment);

        const message: IMessage = {
          embeds: [embed],
        };

        if (user) message.content = `<@${user}>`;

        return message;
      },
    };

    return new CommandResolvable(metadata, target);
  }

  public async delete(name: string) {
    const listener = CommandListener.getInstance();

    

    const tag = await this.tagModel
      .findOneAndDelete()
      .where("name")
      .equals(name)
      .lean()
      .exec();

    if (!tag) return;

    listener.removeCommand(name);
  }

  public async rename(originalName: string, newName: string) {
    this.validateName(newName);

    const tag = await this.tagModel
      .findOneAndUpdate()
      .where("name")
      .equals(originalName)
      .set("name", newName)
      .lean()
      .exec();

    if (!tag) return;

    const listener = CommandListener.getInstance();
    listener.removeCommand(originalName);
    listener.addCommand(this.createCommand(tag));
  }

  private validateName(name: string) {
    if (!TAG_NAME_REGEX.test(name)) {
      throw new Error("Invalid tag name");
    }
  }
}
