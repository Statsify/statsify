/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  ApiService,
  ChoiceArgument,
  Command,
  CommandContext,
  ErrorMessage,
  IMessage,
  LocalizeFunction,
  SubCommand,
  TextArgument,
} from "@statsify/discord";
import { ApplicationCommandOptionType } from "discord-api-types/v10";
import { DemoProfile } from "./demo.profile.js";
import {
  User,
  UserBoxes,
  UserFont,
  UserFooter,
  UserLogo,
  UserPalette,
  UserTheme,
  UserTier,
} from "@statsify/schemas";
import { convertColorCodes } from "#lib/convert-color-codes";
import { getBackground, getLogo } from "@statsify/assets";
import { getTheme } from "#themes";
import { removeFormatting } from "@statsify/util";
import { render } from "@statsify/rendering";

@Command({ description: (t) => t("commands.theme") })
export class ThemeCommand {
  public constructor(private readonly apiService: ApiService) {}

  @SubCommand({
    description: (t) => t("commands.theme-boxes"),
    tier: UserTier.GOLD,
    preview: "boxes.png",
    args: [
      new ChoiceArgument({
        name: "boxes",
        required: true,
        choices: [
          ["Default", UserBoxes.DEFAULT],
          ["HD", UserBoxes.HD],
          ["Ultra HD", UserBoxes.UHD],
        ],
      }),
    ],
  })
  public boxes(context: CommandContext) {
    const boxes = context.option<UserBoxes>("boxes");
    return this.updateField(context, "theme", "boxes", boxes);
  }

  @SubCommand({
    description: (t) => t("commands.theme-font"),
    tier: UserTier.GOLD,
    preview: "font.png",
    args: [
      new ChoiceArgument({
        name: "font",
        required: true,
        choices: [
          ["Default", UserFont.DEFAULT],
          ["HD", UserFont.HD],
        ],
      }),
    ],
  })
  public font(context: CommandContext) {
    const font = context.option<UserFont>("font");
    return this.updateField(context, "theme", "font", font);
  }

  @SubCommand({
    description: (t) => t("commands.theme-palette"),
    tier: UserTier.DIAMOND,
    preview: "palette.png",
    args: [
      new ChoiceArgument({
        name: "palette",
        required: true,
        choices: [
          ["Default", UserPalette.DEFAULT],
          ["Dark", UserPalette.DARK],
          ["Light", UserPalette.LIGHT],
          ["No Backgrounds", UserPalette.NO_BACKGROUNDS],
        ],
      }),
    ],
  })
  public palette(context: CommandContext) {
    const palette = context.option<UserPalette>("palette");
    return this.updateField(context, "theme", "palette", palette);
  }

  @SubCommand({ description: (t) => t("commands.theme-view") })
  public async view(context: CommandContext) {
    const user = context.getUser();
    const t = context.t();

    if (!user?.uuid) throw new ErrorMessage("verification.requiredVerification");

    const profile = await this.getProfile(t, "theme", user);

    return {
      content: t("config.theme.view"),
      files: [{ name: "theme.png", data: profile, type: "image/png" }],
    };
  }

  @SubCommand({
    description: (t) => t("commands.theme-footer-message"),
    args: [new TextArgument("message")],
    tier: UserTier.NETHERITE,
    preview: "footer.png",
    group: "footer",
  })
  public message(context: CommandContext) {
    const message = convertColorCodes(context.option<string>("message")).replace(
      /§\^\d\^/g,
      ""
    );

    const length = removeFormatting(message).length;

    if (length > 50) throw new ErrorMessage("errors.footerTooLong");

    return this.updateField(context, "footer", "message", message);
  }

  @SubCommand({
    description: (t) => t("commands.theme-footer-icon"),
    args: [
      new ChoiceArgument({
        name: "icon",
        required: true,
        choices: [
          ["Default", UserLogo.DEFAULT],
          ["Iron", UserLogo.IRON],
          ["Gold", UserLogo.GOLD],
          ["Diamond", UserLogo.DIAMOND],
          ["Emerald", UserLogo.EMERALD],
          ["Venom", UserLogo.VENOM],
          ["Pink", UserLogo.PINK],
          ["Amethyst", UserLogo.AMETHYST],
          ["Sculk", UserLogo.SCULK],
          ["Netherite", UserLogo.NETHERITE],
          ["Ruby", UserLogo.RUBY],
        ],
        type: ApplicationCommandOptionType.Number,
      }),
    ],
    tier: UserTier.IRON,
    preview: "footer.png",
    group: "footer",
  })
  public icon(context: CommandContext) {
    const user = context.getUser();
    if (!user?.uuid) throw new ErrorMessage("verification.requiredVerification");

    const icon = context.option<UserLogo>("icon");

    if (icon > (user.tier ?? UserTier.NONE))
      throw new ErrorMessage("errors.higherTierRequiredForIcon");

    return this.updateField(context, "footer", "icon", icon);
  }

  @SubCommand({ description: (t) => t("commands.theme-footer-reset"), group: "footer" })
  public async reset(context: CommandContext) {
    const user = context.getUser();
    const t = context.t();

    if (!user?.uuid) throw new ErrorMessage("verification.requiredVerification");

    user.footer = {
      icon: User.tierToLogo(user.tier ?? UserTier.NONE),
      message: null,
    };

    await this.apiService.updateUser(user.id, { footer: user.footer });

    const profile = await this.getProfile(t, "footer", user);

    return {
      content: t("config.footer.reset"),
      files: [{ name: "footer.png", data: profile, type: "image/png" }],
    };
  }

  private async updateField<
    M extends "theme" | "footer",
    K extends keyof T,
    T = M extends "theme" ? UserTheme : UserFooter
  >(context: CommandContext, mode: M, field: K, value: T[K]): Promise<IMessage> {
    const user = context.getUser();
    const t = context.t();

    if (!user?.uuid) throw new ErrorMessage("verification.requiredVerification");

    user[mode] = { ...user[mode], [field]: value };
    await this.apiService.updateUser(user.id, { [mode]: user[mode] });

    const profile = await this.getProfile(t, mode, user);

    return {
      content: mode === "theme" ? t("config.theme.set") : t("config.footer.set"),
      files: [{ name: `${mode}.png`, data: profile, type: "image/png" }],
    };
  }

  private async getProfile(t: LocalizeFunction, mode: "theme" | "footer", user: User) {
    if (!user.uuid) throw new ErrorMessage("errors.unknown");

    const [player, skin, badge, logo, background] = await Promise.all([
      this.apiService.getPlayer(user.uuid),
      this.apiService.getPlayerSkin(user.uuid),
      this.apiService.getUserBadge(user.uuid),
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
        message={
          mode === "theme" ? t("config.theme.profile") : t("config.footer.profile")
        }
      />,
      getTheme(user)
    );

    return canvas.toBuffer("png");
  }
}
