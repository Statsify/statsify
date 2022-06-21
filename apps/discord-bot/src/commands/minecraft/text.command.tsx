/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Command, CommandContext, IMessage } from "@statsify/discord";
import { NumberArgument, TextArgument } from "#arguments";
import { render } from "@statsify/rendering";

@Command({
  description: (t) => t("commands.text"),
  args: [new TextArgument("content"), new NumberArgument("size", 1, 9)],
})
export class TextCommand {
  public async run(context: CommandContext): Promise<IMessage> {
    const content = context.option<string>("content").trim();
    const size = Math.min(context.option<number>("size", 2), 9);

    const text = content
      .replaceAll("\\&", "󰀀")
      .replace(/&\S/g, (m) => m.replace("&", "§"))
      .replaceAll("󰀀", "&");

    const canvas = render(<text size={size}>{text}</text>);
    const buffer = await canvas.toBuffer("png");

    return {
      files: [{ data: buffer, name: "text.png", type: "image/png" }],
    };
  }
}
