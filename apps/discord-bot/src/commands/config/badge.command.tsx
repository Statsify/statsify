/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import axios from "axios";
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

const BADGE_IMAGE_TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp"];
const CUSTOM_EMOJI_REGEX = /^<a?:\w+:(\d+)>$/;

const PIXEL_EMOJI_URL = "https://cdn.jsdelivr.net/gh/AmberWat/PixelTwemojiMC-18@v8.0/assets";
const PIXEL_EMOJI_SIZE = 18;

// The same emoji arrives with or without U+FE0F depending on the keyboard, so lookups ignore it
const withoutVariationSelector = (emoji: string) => emoji.replaceAll("\uFE0F", "");

interface PixelEmoji {
  atlas: Image;
  x: number;
  y: number;
}

interface MinecraftFont {
  providers: { file: string; chars: string[] }[];
}

@Command({ description: (t) => t("commands.badge") })
export class BadgeCommand {
  private pixelEmojis?: Map<string, PixelEmoji>;

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
  public async image(context: CommandContext) {
    const user = context.getUser();
    const file = context.option<APIAttachment>("badge");

    if (!user?.uuid) throw new ErrorMessage("verification.requiredVerification");

    if (!BADGE_IMAGE_TYPES.includes(file.content_type ?? ""))
      throw new ErrorMessage("errors.unsupportedFileType");

    const image = await loadImage(file.url).catch(() => {
      throw new ErrorMessage("errors.unknown");
    });

    const badge = this.fitBadge(image);
    const { data } = badge.getContext("2d").getImageData(0, 0, badge.width, badge.height);

    // A file cut off before its pixel data still loads, but draws nothing
    if (data.every((value) => value === 0)) throw new ErrorMessage("errors.unknown");

    return this.setBadge(context, user, badge);
  }

  @SubCommand({
    description: (t) => t("commands.badge-emoji"),
    tier: UserTier.GOLD,
    preview: "badge.png",
    args: [new TextArgument("emoji", (t) => t("arguments.emoji"))],
  })
  public async emoji(context: CommandContext) {
    const user = context.getUser();
    const emoji = context.option<string>("emoji").trim();

    if (!user?.uuid) throw new ErrorMessage("verification.requiredVerification");

    const customEmoji = emoji.match(CUSTOM_EMOJI_REGEX);

    const badge = customEmoji ?
      await this.getCustomEmojiBadge(customEmoji[1]) :
      await this.getPixelEmojiBadge(emoji);

    return this.setBadge(context, user, badge);
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
    mode: "view" | "reset"
  ): Promise<IMessage> {
    const userId = context.getInteraction().getUserId();
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

  private async setBadge(context: CommandContext, user: User, badge: Canvas): Promise<IMessage> {
    const userId = context.getInteraction().getUserId();
    const t = context.t();

    await this.apiService.updateUserBadge(userId, await badge.toBuffer("png"));
    const profile = await this.getProfile(t, user, badge);

    return {
      content: t("config.badge.set") as string,
      files: [{ name: "badge.png", data: profile, type: "image/png" }],
    };
  }

  private async getCustomEmojiBadge(id: string) {
    const image = await loadImage(`https://cdn.discordapp.com/emojis/${id}.png?size=32`).catch(() => {
      throw new ErrorMessage("errors.invalidBadgeEmoji");
    });

    return this.fitBadge(image);
  }

  private async getPixelEmojiBadge(input: string) {
    this.pixelEmojis ??= await this.loadPixelEmojis();
    const emoji = this.pixelEmojis.get(withoutVariationSelector(input));

    if (!emoji) throw new ErrorMessage("errors.invalidBadgeEmoji");

    // At 2x the pixel art stays sharp and is as tall as Minecraft draws it beside the name
    const canvas = createCanvas(PIXEL_EMOJI_SIZE * 2, PIXEL_EMOJI_SIZE * 2);
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;

    ctx.drawImage(
      emoji.atlas,
      emoji.x,
      emoji.y,
      PIXEL_EMOJI_SIZE,
      PIXEL_EMOJI_SIZE,
      0,
      0,
      canvas.width,
      canvas.height
    );

    return canvas;
  }

  private async loadPixelEmojis() {
    const [font, remappings, emojiAtlas, flagAtlas] = await Promise.all([
      axios.get<MinecraftFont>(`${PIXEL_EMOJI_URL}/minecraft/font/default.json`),
      axios.get<Record<string, string>>(`${PIXEL_EMOJI_URL}/emoji_remappings/lang/en_us.json`),
      loadImage(`${PIXEL_EMOJI_URL}/twemoji/textures/font/emoji.png`),
      loadImage(`${PIXEL_EMOJI_URL}/twemoji/textures/font/flags.png`),
    ]).catch(() => {
      throw new ErrorMessage("errors.unknown");
    });

    const atlases = new Map([
      ["twemoji:font/emoji.png", emojiAtlas],
      ["twemoji:font/flags.png", flagAtlas],
    ]);

    const emojis = new Map<string, PixelEmoji>();

    for (const { file, chars } of font.data.providers) {
      const atlas = atlases.get(file);
      if (!atlas) continue;

      for (const [y, row] of chars.entries()) {
        for (const [x, char] of [...row].entries()) {
          emojis.set(char, { atlas, x: x * PIXEL_EMOJI_SIZE, y: y * PIXEL_EMOJI_SIZE });
        }
      }
    }

    // The pack draws multi-character emoji (skin tones, flags, keycaps, ZWJ sequences) from
    // single characters it remaps them to
    for (const [sequence, char] of Object.entries(remappings.data)) {
      const emoji = emojis.get(char);
      if (emoji) emojis.set(withoutVariationSelector(sequence), emoji);
    }

    return emojis;
  }

  private fitBadge(image: Image) {
    const canvas = createCanvas(32, 32);
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;

    const ratio = Math.min(canvas.width / image.width, canvas.height / image.height);
    const scaled = image.width > 32 || image.height > 32;

    const width = scaled ? image.width * ratio : image.width;
    const height = scaled ? image.height * ratio : image.height;

    ctx.drawImage(
      image,
      0,
      0,
      image.width,
      image.height,
      (canvas.width - width) / 2,
      (canvas.height - height) / 2,
      width,
      height
    );

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
