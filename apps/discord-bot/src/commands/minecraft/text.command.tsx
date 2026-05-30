/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  ChoiceArgument,
  Command,
  CommandContext,
  IMessage,
  NumberArgument,
  TextArgument,
} from "@statsify/discord";
import { Container } from "typedi";
import { FontRenderer, StyleLocation, render } from "@statsify/rendering";
import { Multiline } from "#components";
import { convertColorCodes } from "#lib/convert-color-codes";
import { encodeAnimatedWebP } from "../../util/animated-webp.js";
import { getTheme } from "#themes";

const OBFUSCATED_FRAMES = 10;
const OBFUSCATED_DELAY_MS = 50;

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

    const text = convertColorCodes(content).replaceAll(String.raw`\n`, "\n");
    let theme = getTheme(user);

    if (theme === undefined) {
      theme = {
        context: { renderer: Container.get(FontRenderer) },
        elements: {},
      };
    }

    // §k in the converted text means at least one obfuscated run is present.
    // Animated path: render OBFUSCATED_FRAMES copies; fillText re-scrambles each call.
    // Static path: unchanged — single PNG.
    const hasObfuscated = text.includes("§k");

    const profileNode = (
      <div direction="column" padding={2}>
        <Multiline size={size} align={alignment}>
          {text}
        </Multiline>
      </div>
    );

    if (!hasObfuscated) {
      const canvas = render(profileNode, theme);
      const buffer = await canvas.toBuffer("png");
      return {
        files: [{ data: buffer, name: "text.png", type: "image/png" }],
      };
    }

    // Animated: each render() call picks fresh random glyphs for §k nodes.
    // Static characters are pixel-identical across frames (same TextNode[], same draw path).
    const frameCanvases = Array.from({ length: OBFUSCATED_FRAMES }, () =>
      render(profileNode, theme)
    );

    const webpData = await encodeAnimatedWebP(frameCanvases, OBFUSCATED_DELAY_MS);

    return {
      files: [{ data: webpData, name: "text.webp", type: "image/webp" }],
    };
  }
}
