/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  ActionRowBuilder,
  Command,
  ContainerBuilder,
  IMessage,
  SectionBuilder,
  ThumbnailBuilder,
} from "@statsify/discord";
import { STATUS_COLORS } from "@statsify/logger";
import { UserLogo } from "@statsify/schemas";
import { config } from "@statsify/util";
import { getLogoPath } from "@statsify/assets";
import { linkButton } from "#constants";
import { readFile } from "node:fs/promises";

@Command({ description: (t) => t("commands.invite") })
export class InviteCommand {
  public async run(): Promise<IMessage> {
    const applicationId = await config("discordBot.applicationId");
    const inviteUrl = `https://discord.com/oauth2/authorize?client_id=${applicationId}&permissions=388168&scope=applications.commands%20bot&response_type=code&redirect_uri=https%3A%2F%2Fstatsify.net%2Fbot%2Fthanks`;

    const container = new ContainerBuilder([
      new SectionBuilder(
        [(t) => `## ${t("embeds.invite.title")}`, (t) => t("embeds.invite.description")],
        new ThumbnailBuilder("attachment://logo.png")
      ),
      new ActionRowBuilder([
        linkButton("invite", inviteUrl),
        linkButton("discord"),
        linkButton("premium"),
        linkButton("website"),
        linkButton("github"),
      ]),
    ]).accentColor(STATUS_COLORS.info);

    const logo = await readFile(getLogoPath(UserLogo.DEFAULT, 64));

    return {
      components: [container],
      files: [{ name: "logo.png", data: logo, type: "image/png" }],
    };
  }
}
