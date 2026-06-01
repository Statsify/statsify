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

// §k only: 10 frames × 50 ms = 500 ms fast flicker loop (matches Minecraft tick feel).
const OBFUSCATED_FRAMES = 10;

// §y present: 20 frames × 50 ms = 1.0 s smooth rainbow cycle.
// 20 frames also covers §k when both codes appear in the same text.
const RAINBOW_FRAMES = 20;

const ANIMATED_DELAY_MS = 50;

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

    // Detect animated codes.  §k = obfuscated scramble; §y = flowing rainbow.
    const hasObfuscated = text.includes("§k");
    const hasRainbow = text.includes("§y");
    const needsAnimation = hasObfuscated || hasRainbow;

    const profileNode = (
      <div direction="column" padding={2}>
        <Multiline size={size} align={alignment}>
          {text}
        </Multiline>
      </div>
    );

    if (!needsAnimation) {
      const canvas = render(profileNode, theme);
      const buffer = await canvas.toBuffer("png");
      return {
        files: [{ data: buffer, name: "text.png", type: "image/png" }],
      };
    }

    // Use more frames when rainbow is present so the hue advance per frame is
    // small enough for a smooth flow.  Both §k and §y are driven by the same
    // render() call — animationPhase drives rainbow hue; Math.random() drives
    // obfuscated reseed.  ONE mechanism, ONE render call per frame.
    const frames = hasRainbow ? RAINBOW_FRAMES : OBFUSCATED_FRAMES;
    const renderer = theme.context.renderer;

    const frameCanvases = Array.from({ length: frames }, (_, i) => {
      // phase ∈ [0, 1): advancing by 1/frames per frame.
      // At phase = k/frames, hue shifts by 360 * (k/frames)° — completing a full
      // 360° cycle after `frames` frames for a seamless loop.
      renderer.animationPhase = i / frames;
      return render(profileNode, theme);
    });

    const webpData = await encodeAnimatedWebP(frameCanvases, ANIMATED_DELAY_MS);

    return {
      files: [{ data: webpData, name: "text.webp", type: "image/webp" }],
    };
  }
}
