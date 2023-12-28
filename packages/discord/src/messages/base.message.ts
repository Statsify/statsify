/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { APIAllowedMentions, APIAttachment } from "discord-api-types/v10";
import { ActionRowBuilder } from "./components/index.js";
import { EmbedBuilder } from "./embed.js";
import { InteractionAttachment, InteractionContent } from "#interaction";
import { LocalizationString, LocalizeFunction, translateField } from "./localize.js";
import type { RemoveMethods } from "@statsify/util";

export type IMessage = RemoveMethods<Message>;

export class Message {
	public attachments?: APIAttachment[];
	public components?: ActionRowBuilder[];
	public content?: LocalizationString;
	public embeds?: EmbedBuilder[];
	public ephemeral?: boolean;
	public files?: InteractionAttachment[];
	public mentions?: APIAllowedMentions;
	public tts?: boolean;

	public constructor(data: IMessage) {
		Object.assign(this, data);
	}

	public build(locale: LocalizeFunction): InteractionContent {
		return {
			attachments: this.attachments,
			components: this.components?.map((component) => component.build(locale)),
			content: translateField(locale, this.content),
			embeds: this.embeds?.map((embed) => embed.build(locale)),
			ephemeral: this.ephemeral,
			files: this.files,
			mentions: this.mentions,
			tts: this.tts,
		};
	}

	public toAPI(locale: LocalizeFunction) {
		const data = this.build(locale);

		const res = {
			content: data.content,
			tts: data.tts,
			flags: data.ephemeral ? 1 << 6 : undefined,
			allowed_mentions: data.mentions,
			embeds: data.embeds,
			attachments: data.attachments,
			components: data.components,
		};

		if (data.files)
			return {
				files: data.files,
				payload_json: res,
			};

		return res;
	}
}
