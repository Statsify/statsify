/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { APIButtonComponentBase, ButtonStyle, ComponentType } from "discord-api-types/v10";
import { LocalizationString, LocalizeFunction, translateField } from "../localize.js";
import { parseEmoji } from "./parse-emoji.js";
import { randomUUID } from "node:crypto";

export class ButtonBuilder {
	#label: LocalizationString;
	#emoji?: LocalizationString;
	#style: ButtonStyle;
	#custom_id?: string;
	#disabled: boolean;
	#url?: string;

	public constructor() {
		this.style(ButtonStyle.Primary);
		this.customId(randomUUID());
	}

	public label(label: LocalizationString): this {
		this.#label = label;
		return this;
	}

	public emoji(emoji: LocalizationString): this {
		this.#emoji = emoji;
		return this;
	}

	public style(style: ButtonStyle): this {
		this.#style = style;
		return this;
	}

	public customId(customId: string): this {
		this.#custom_id = customId;
		return this;
	}

	public url(url: string): this {
		this.#url = url;
		this.#custom_id = undefined;
		return this;
	}

	public disable(disabled?: boolean): this {
		this.#disabled = disabled === undefined ? true : disabled;

		return this;
	}

	public getCustomId() {
		return this.#custom_id as string;
	}

	public build(locale: LocalizeFunction): APIButtonComponentBase<any> & { custom_id?: string; url?: string } {
		return {
			label: translateField(locale, this.#label),
			style: this.#style,
			emoji: this.#emoji ? parseEmoji(this.#emoji, locale) : undefined,
			custom_id: this.#custom_id,
			disabled: this.#disabled,
			type: ComponentType.Button,
			url: this.#url,
		};
	}
}
