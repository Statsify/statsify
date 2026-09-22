/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { APIAttachment } from "discord-api-types/v10";
import {
  ApiService,
  Command,
  CommandContext,
  ErrorMessage,
  FileArgument,
  IMessage,
  LocalizeFunction,
  SubCommand,
  TextArgument,
} from "@statsify/discord";
import { type Canvas, Image } from "skia-canvas";
import { DemoProfile } from "./demo.profile.js";
import { User, UserTier } from "@statsify/schemas";
import { createCanvas, loadImage, render } from "@statsify/rendering";
import { getBackground, getLogo } from "@statsify/assets";
import { getTheme } from "#themes";

const BADGE_IMAGE_TYPE_PREFIX = "image/";
const CUSTOM_EMOJI_REGEX = /^<a?:\w+:(\d+)>$/;
const TWEMOJI_BASE_URL = "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72";

@Command({ description: (t) => t("commands.badge") })
export class BadgeCommand {
  public constructor(private readonly apiService: ApiService) {}

  @SubCommand({
    description: (t) => t("commands.badge-view"),
    tier: UserTier.GOLD,
    preview: "badge.png",
  })
  public view(context: CommandContext) {
    return this.run(context, "view");
  }

  @SubCommand({
    description: (t) => t("commands.badge-image"),
    tier: UserTier.GOLD,
    preview: "badge.png",
    args: [new FileArgument("badge", true)],
  })
  public image(context: CommandContext) {
    return this.run(context, "image");
  }

  @SubCommand({
    description: (t) => t("commands.badge-emoji"),
    tier: UserTier.GOLD,
    preview: "badge.png",
    args: [new TextArgument("emoji", (t) => t("arguments.emoji"))],
  })
  public emoji(context: CommandContext) {
    return this.run(context, "emoji");
  }

  @SubCommand({
    description: (t) => t("commands.badge-reset"),
    tier: UserTier.GOLD,
    preview: "badge.png",
  })
  public reset(context: CommandContext) {
    return this.run(context, "reset");
  }

  private async run(
    context: CommandContext,
    mode: "view" | "image" | "emoji" | "reset"
  ): Promise<IMessage> {
    const userId = context.getInteraction().getUserId();
    const file = context.option<APIAttachment | null>("badge");
    const emoji = context.option<string | null>("emoji");
    const user = context.getUser();
    const t = context.t();

    if (!user?.uuid) throw new ErrorMessage("verification.requiredVerification");

    switch (mode) {
      case "view": {
        const badge = await this.apiService.getUserBadge(userId);

        if (!badge) throw new ErrorMessage("errors.unknown");

        const profile = await this.getProfile(t, user, badge);

        return {
          content: t("config.badge.view") as string,
          files: [{ name: "badge.png", data: profile, type: "image/png" }],
        };
      }

      case "image": {
        const canvas = await this.getBadgeCanvas(file as APIAttachment);

        await this.apiService.updateUserBadge(userId, await canvas.toBuffer("png"));
        const profile = await this.getProfile(t, user, canvas);

        return {
          content: t("config.badge.set") as string,
          files: [{ name: "badge.png", data: profile, type: "image/png" }],
        };
      }

      case "emoji": {
        const canvas = await this.getEmojiCanvas(emoji as string);

        await this.apiService.updateUserBadge(userId, await canvas.toBuffer("png"));
        const profile = await this.getProfile(t, user, canvas);

        return {
          content: t("config.badge.set") as string,
          files: [{ name: "badge.png", data: profile, type: "image/png" }],
        };
      }

      case "reset": {
        await this.apiService.deleteUserBadge(userId);
        const badge = await this.apiService.getUserBadge(userId);

        const profile = await this.getProfile(t, user, badge);

        return {
          content: t("config.badge.reset") as string,
          files: [{ name: "badge.png", data: profile, type: "image/png" }],
        };
      }
    }
  }

  private async getBadgeCanvas(file: APIAttachment) {
    const canvas = createCanvas(32, 32);
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;

    if (!file.content_type?.startsWith(BADGE_IMAGE_TYPE_PREFIX))
      throw new ErrorMessage(
        (t) => t("errors.unsupportedFileType.title"),
        (t) => t("errors.unsupportedFileType.description")
      );

    const badge = await this.loadBadgeImage(file.url);

    const ratio = Math.min(canvas.width / badge.width, canvas.height / badge.height);
    const scaled = badge.width > 32 || badge.height > 32;

    const width = scaled ? badge.width * ratio : badge.width;
    const height = scaled ? badge.height * ratio : badge.height;

    ctx.drawImage(
      badge,
      0,
      0,
      badge.width,
      badge.height,
      (canvas.width - width) / 2,
      (canvas.height - height) / 2,
      width,
      height
    );

    return canvas;
  }

  private async getEmojiCanvas(input: string) {
    const canvas = createCanvas(32, 32);
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;

    const emoji = input.trim();
    const customEmoji = emoji.match(CUSTOM_EMOJI_REGEX);

    if (customEmoji) {
      const badge = await this.loadEmojiImage(
        `https://cdn.discordapp.com/emojis/${customEmoji[1]}.png?size=32&quality=lossless`
      );

      ctx.drawImage(badge, 0, 0, badge.width, badge.height, 0, 0, 32, 32);
      return canvas;
    }

    const badge = await this.loadTwemojiImage(emoji);

    ctx.drawImage(badge, 0, 0, badge.width, badge.height, 0, 0, 32, 32);

    return canvas;
  }

  private async loadBadgeImage(url: string) {
    try {
      return await loadImage(url);
    } catch {
      throw new ErrorMessage(
        (t) => t("errors.unsupportedFileType.title"),
        (t) => t("errors.unsupportedFileType.description")
      );
    }
  }

  private async loadEmojiImage(url: string) {
    try {
      return await loadImage(url);
    } catch {
      throw new ErrorMessage(
        (t) => t("errors.invalidBadgeEmoji.title"),
        (t) => t("errors.invalidBadgeEmoji.description")
      );
    }
  }

  private async loadTwemojiImage(input: string) {
    const codepoints = this.toTwemojiCodepoints(input);
    const urls = [...new Set(codepoints)].map((codepoint) => `${TWEMOJI_BASE_URL}/${codepoint}.png`);

    return Promise.any(urls.map((url) => loadImage(url))).catch(() => {
      throw new ErrorMessage(
        (t) => t("errors.invalidBadgeEmoji.title"),
        (t) => t("errors.invalidBadgeEmoji.description")
      );
    });
  }

  private toTwemojiCodepoints(input: string) {
    const codepoints = [...input]
      .map((char) => char.codePointAt(0)?.toString(16))
      .filter((codepoint): codepoint is string => !!codepoint);

    const emojiPresentationCodepoints = codepoints.filter((codepoint) => !["200d", "fe0f"].includes(codepoint));

    if (emojiPresentationCodepoints.length === 0) {
      throw new ErrorMessage(
        (t) => t("errors.invalidBadgeEmoji.title"),
        (t) => t("errors.invalidBadgeEmoji.description")
      );
    }

    return [
      codepoints.join("-"),
      codepoints.filter((codepoint) => codepoint !== "fe0f").join("-"),
    ];
  }

  private async getProfile(t: LocalizeFunction, user: User, badge?: Image | Canvas) {
    if (!user?.uuid) throw new ErrorMessage("errors.unknown");

    const [player, skin, logo, background] = await Promise.all([
      this.apiService.getPlayer(user.uuid),
      this.apiService.getPlayerSkin(user.uuid, user),
      getLogo(user),
      getBackground("hypixel", "overall"),
    ]);

    const canvas = render(
      <DemoProfile
        background={background}
        logo={logo}
        player={player}
        skin={skin}
        badge={badge}
        user={user}
        message={t("config.badge.profile")}
      />,
      getTheme(user)
    );

    return canvas.toBuffer("png");
  }
}
