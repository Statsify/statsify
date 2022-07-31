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
} from "@statsify/discord";
import { DemoProfile } from "./demo.profile";
import { FooterSubCommandGroup } from "./footer.sub-command-group";
import {
  User,
  UserBoxes,
  UserFont,
  UserPalette,
  UserTheme,
  UserTier,
} from "@statsify/schemas";
import { getBackground, getLogo } from "@statsify/assets";
import { getTheme } from "#themes";
import { render } from "@statsify/rendering";

@Command({ description: (t) => t("commands.theme"), groups: [FooterSubCommandGroup] })
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
    return this.updateField(context, "boxes", boxes);
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
    return this.updateField(context, "font", font);
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
    return this.updateField(context, "palette", palette);
  }

  @SubCommand({ description: (t) => t("commands.theme-view") })
  public async view(context: CommandContext) {
    const user = context.getUser();
    const t = context.t();

    if (!user?.uuid) throw new ErrorMessage("verification.requiredVerification");

    const profile = await this.getProfile(t, user);

    return {
      content: t("config.theme.view"),
      files: [{ name: "theme.png", data: profile, type: "image/png" }],
    };
  }

  private async updateField<T extends keyof UserTheme>(
    context: CommandContext,
    field: T,
    value: UserTheme[T]
  ): Promise<IMessage> {
    const user = context.getUser();
    const t = context.t();

    if (!user?.uuid) throw new ErrorMessage("verification.requiredVerification");
    user.theme = { ...user.theme, [field]: value };

    await this.apiService.updateUser(user.id, { theme: user.theme });

    const profile = await this.getProfile(t, user);

    return {
      content: t("config.theme.set"),
      files: [{ name: "theme.png", data: profile, type: "image/png" }],
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
        message={t("config.theme.profile")}
      />,
      getTheme(user)
    );

    return canvas.toBuffer("png");
  }
}
