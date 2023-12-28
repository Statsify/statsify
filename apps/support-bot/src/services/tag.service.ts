/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
	CommandContext,
	CommandMetadata,
	CommandPoster,
	CommandResolvable,
	EmbedBuilder,
	ErrorMessage,
	IMessage,
	UserArgument,
} from "@statsify/discord";
import { CommandListener } from "#lib";
import { Inject, Service } from "typedi";
import { STATUS_COLORS } from "@statsify/logger";
import { Tag } from "@statsify/schemas";
import { config } from "@statsify/util";
import type { ReturnModelType } from "@typegoose/typegoose";

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

	public async create(name: string, content: string, attachment?: string) {
		this.validateName(name);

		const tag = { name, content, attachment };

		const command = this.createCommand(tag);

		const listener = CommandListener.getInstance();
		listener.addCommand(command);

		const { id } = await this.commandPoster.post(command, config("supportBot.applicationId"), config("supportBot.guild"));

		await this.tagModel
			.replaceOne({ name }, { id, ...tag }, { upsert: true })
			.lean()
			.exec();

		return command;
	}

	public createCommand(tag: Omit<Tag, "id">) {
		const metadata: CommandMetadata = {
			name: tag.name,
			description: `Sends the tag "${tag.name}"`,
			methodName: "run",
			args: [new UserArgument("user", false)],
			cooldown: 0,
		};

		const target = {
			run(context: CommandContext) {
				const user = context.option<string | null>("user");

				const embed = new EmbedBuilder().color(STATUS_COLORS.info).description(tag.content);

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

		const tag = await this.tagModel.findOneAndDelete().where("name").equals(name).lean().exec();

		if (!tag) throw new ErrorMessage("errors.tagNotFound");

		listener.removeCommand(name);

		await this.commandPoster.delete(tag.id, config("supportBot.applicationId"), config("supportBot.guild"));
	}

	public async rename(originalName: string, newName: string) {
		this.validateName(newName);

		const tag = await this.tagModel.findOne().where("name").equals(originalName).lean().exec();

		if (!tag) throw new ErrorMessage("errors.tagNotFound");

		await this.delete(originalName);
		await this.create(newName, tag.content, tag.attachment);
	}

	private validateName(name: string) {
		if (!TAG_NAME_REGEX.test(name)) throw new ErrorMessage("errors.invalidTagName");
	}
}
