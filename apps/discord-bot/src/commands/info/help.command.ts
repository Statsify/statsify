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
  SeparatorBuilder,
  TextDisplayBuilder,
  ThumbnailBuilder,
} from "@statsify/discord";
import { STATUS_COLORS } from "@statsify/logger";
import { UserLogo } from "@statsify/schemas";
import { getLogoPath } from "@statsify/assets";
import { linkButton } from "#constants";
import { readFile } from "node:fs/promises";

const TOPICS = ["games", "leaderboards", "session", "minecraft"] as const;

@Command({ description: (t) => t("commands.help") })
export class HelpCommand {
  public async run(): Promise<IMessage> {
    const container = new ContainerBuilder([
      new SectionBuilder(
        [(t) => `## ${t("embeds.help.title")}`, (t) => t("embeds.help.description")],
        new ThumbnailBuilder("attachment://logo.png")
      ),
      new SeparatorBuilder(),
      new TextDisplayBuilder((t) =>
        TOPICS.map(
          (topic) => `**${t(`embeds.help.${topic}.title`)}**\n${t(`embeds.help.${topic}.description`)}`
        ).join("\n\n")
      ),
      new ActionRowBuilder([linkButton("discord"), linkButton("invite"), linkButton("premium")]),
    ]).accentColor(STATUS_COLORS.info);

    const logo = await readFile(getLogoPath(UserLogo.DEFAULT, 64));

    return {
      components: [container],
      files: [{ name: "logo.png", data: logo, type: "image/png" }],
    };
  }
}
