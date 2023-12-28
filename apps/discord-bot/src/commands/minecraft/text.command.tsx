/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ChoiceArgument, Command, CommandContext, IMessage, NumberArgument, TextArgument } from "@statsify/discord";
import { Multiline } from "#components";
import { StyleLocation, render } from "@statsify/rendering";
import { convertColorCodes } from "#lib/convert-color-codes";
import { getTheme } from "#themes";

@Command({
	description: (t) => t("commands.text"),
	args: [
		new TextArgument("content"),
		new NumberArgument("size", 1, 9),
		new ChoiceArgument({
			name: "alignment",
			choices: ["left", "center", "right"] as StyleLocation[],
			required: false,
		}),
	],
})
export class TextCommand {
	public async run(context: CommandContext): Promise<IMessage> {
		const user = context.getUser();

		const content = context.option<string>("content").trim();
		const size = Math.min(context.option<number>("size", 2), 9);
		const alignment = context.option<StyleLocation>("alignment", "left");

		const text = convertColorCodes(content).replaceAll("\\n", "\n");

		const canvas = render(
			<div direction="column">
				<Multiline size={size} align={alignment}>
					{text}
				</Multiline>
			</div>,
			getTheme(user)
		);

		const buffer = await canvas.toBuffer("png");

		return {
			files: [{ data: buffer, name: "text.png", type: "image/png" }],
		};
	}
}
