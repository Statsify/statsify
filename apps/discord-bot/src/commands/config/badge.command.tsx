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
    description: (t) => t("commands.badge-set"),
    tier: UserTier.GOLD,
    preview: "badge.png",
    args: [
      new FileArgument("badge"),
      new TextArgument("emoji", (t) => t("arguments.emoji"), false),
    ],
  })
  public set(context: CommandContext) {
    return this.run(context, "set");
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
    mode: "view" | "set" | "reset"
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

      case "set": {
        if (!file && !emoji)
          throw new ErrorMessage(
            (t) => t("errors.unknown.title"),
            (t) => t("errors.unknown.description")
          );

        const canvas = file ? await this.getBadgeCanvas(file) : await this.getEmojiCanvas(emoji as string);

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

    if (!["image/png", "image/jpeg", "image/gif"].includes(file.content_type ?? ""))
      throw new ErrorMessage(
        (t) => t("errors.unsupportedFileType.title"),
        (t) => t("errors.unsupportedFileType.description")
      );

    const badge = await loadImage(file.url);

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

    const customEmoji = input.trim().match(/^<a?:\w+:(\d+)>$/);

    if (customEmoji) {
      const badge = await loadImage(`https://cdn.discordapp.com/emojis/${customEmoji[1]}.png?size=32&quality=lossless`);
      ctx.drawImage(badge, 0, 0, badge.width, badge.height, 0, 0, 32, 32);
      return canvas;
    }

    ctx.font = "28px Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(input.trim(), 16, 17);

    return canvas;
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
