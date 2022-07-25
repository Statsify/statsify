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
  LocalizeFunction,
  SubCommand,
  TextArgument,
} from "@statsify/discord";
import { ApplicationCommandOptionType } from "discord-api-types/v10";
import { DemoProfile } from "./demo.profile";
import { User, UserFooter, UserLogo, UserTier } from "@statsify/schemas";
import { convertColorCodes } from "#lib/convert-color-codes";
import { getBackground, getLogo } from "@statsify/assets";
import { getTheme } from "#themes";
import { removeFormatting } from "@statsify/util";
import { render } from "@statsify/rendering";

@Command({ name: "footer", description: (t) => t("commands.theme-footer") })
export class FooterSubCommandGroup {
  public constructor(private readonly apiService: ApiService) {}

  @SubCommand({
    description: (t) => t("commands.theme-footer-message"),
    args: [new TextArgument("message")],
    tier: UserTier.NETHERITE,
  })
  public message(context: CommandContext) {
    const message = convertColorCodes(context.option<string>("message")).replace(
      /§\^\d\^/g,
      ""
    );

    const length = removeFormatting(message).length;

    if (length > 50) throw new ErrorMessage("errors.footerTooLong");

    return this.updateField(context, "message", message);
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
  })
  public icon(context: CommandContext) {
    const user = context.getUser();
    if (!user?.uuid) throw new ErrorMessage("verification.requiredVerification");

    const icon = context.option<UserLogo>("icon");

    if (icon > (user.tier ?? UserTier.NONE))
      throw new ErrorMessage("errors.higherTierRequiredForIcon");

    return this.updateField(context, "icon", icon);
  }

  @SubCommand({ description: (t) => t("commands.theme-footer-reset") })
  public async reset(context: CommandContext) {
    const user = context.getUser();
    const t = context.t();

    if (!user?.uuid) throw new ErrorMessage("verification.requiredVerification");

    user.footer = {
      icon: User.tierToLogo(user.tier ?? UserTier.NONE),
      message: null,
    };

    await this.apiService.updateUser(user.id, { footer: user.footer });

    const profile = await this.getProfile(t, user);

    return {
      content: t("config.footer.reset"),
      files: [{ name: "footer.png", data: profile, type: "image/png" }],
    };
  }

  private async updateField<T extends keyof UserFooter>(
    context: CommandContext,
    field: T,
    value: UserFooter[T]
  ) {
    const t = context.t();
    const user = context.getUser();

    if (!user?.uuid) throw new ErrorMessage("verification.requiredVerification");

    user.footer = { ...user.footer, [field]: value };

    await this.apiService.updateUser(user.id, { footer: user.footer });

    const profile = await this.getProfile(t, user);

    return {
      content: t("config.footer.set"),
      files: [{ name: "footer.png", data: profile, type: "image/png" }],
    };
  }

  private async getProfile(t: LocalizeFunction, user: User) {
    if (!user?.uuid) throw new ErrorMessage("errors.unknown");

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
        message={t("config.footer.profile")}
      />,
      getTheme(user)
    );

    return canvas.toBuffer("png");
  }
}
