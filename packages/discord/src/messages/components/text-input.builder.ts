/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { APITextInputComponent, ComponentType, TextInputStyle } from "discord-api-types/v10";
import { LocalizationString, LocalizeFunction, translateField } from "../localize.js";
import { randomUUID } from "node:crypto";

export class TextInputBuilder {
	#custom_id: string;
	#label: LocalizationString;
	#max_length?: number;
	#min_length?: number;
	#placeholder?: LocalizationString;
	#required?: boolean;
	#style: TextInputStyle;
	#value?: LocalizationString;

	public constructor() {
		this.style(TextInputStyle.Short);
		this.customId(randomUUID());
	}

	public customId(customId: string): this {
		this.#custom_id = customId;
		return this;
	}

	public label(label: LocalizationString): this {
		this.#label = label;
		return this;
	}

	public minLength(minLength: number): this {
		this.#min_length = minLength;
		return this;
	}

	public maxLength(maxLength: number): this {
		this.#max_length = maxLength;
		return this;
	}

	public placeholder(placeholder: LocalizationString): this {
		this.#placeholder = placeholder;
		return this;
	}

	public required(required: boolean): this {
		this.#required = required;
		return this;
	}

	public style(style: TextInputStyle): this {
		this.#style = style;
		return this;
	}

	public value(value: LocalizationString): this {
		this.#value = value;
		return this;
	}

	public getCustomId() {
		return this.#custom_id;
	}

	public build(locale: LocalizeFunction): APITextInputComponent {
		return {
			custom_id: this.#custom_id,
			label: translateField(locale, this.#label),
			type: ComponentType.TextInput,
			max_length: this.#max_length,
			min_length: this.#min_length,
			placeholder: translateField(locale, this.#placeholder),
			required: this.#required,
			style: this.#style,
			value: translateField(locale, this.#value),
		};
	}
}
