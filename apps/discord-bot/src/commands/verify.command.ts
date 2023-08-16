/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  ActionRowBuilder,
  ApiService,
  ButtonBuilder,
  Command,
  CommandContext,
  EmbedBuilder,
  ErrorMessage,
  IMessage,
  InteractionAttachment,
  MemberService,
  ModalBuilder,
  TextInputBuilder,
} from "@statsify/discord";
import {
  ButtonStyle,
  InteractionResponseType,
  TextInputStyle,
} from "discord-api-types/v10";
import { STATUS_COLORS } from "@statsify/logger";
import { config } from "@statsify/util";
import { getAssetPath } from "@statsify/assets";
import { readFileSync } from "node:fs";

const SUPPORT_BOT_GUILD_ID = config("supportBot.guild");
const SUPPORT_BOT_MEMBER_ROLE_ID = config("supportBot.memberRole");

@Command({ description: (t) => t("commands.verify"), cooldown: 5 })
export class VerifyCommand {
  public constructor(
    private readonly apiService: ApiService,
    private readonly memberService: MemberService
  ) {}

  public async run(context: CommandContext): Promise<IMessage> {
    const t = context.t();

    const userId = context.getInteraction().getUserId();
    const user = context.getUser();
    if (user?.uuid) throw new ErrorMessage("verification.alreadyVerified");

    const verifyGif = this.getVerifyGif();

    const embed = new EmbedBuilder()
      .title((t) => t("verification.instructions.title"))
      .description((t) => t("verification.instructions.description"))
      .color(STATUS_COLORS.info);
    // .image(`attachment://${verifyGif.name}`);

    const modal = new ModalBuilder()
      .title((t) => t("verification.instructions.modal.title"))
      .component(
        new ActionRowBuilder().component(
          new TextInputBuilder()
            .label((t) => t("verification.instructions.modal.input"))
            .placeholder(() => "XXXX")
            .minLength(4)
            .maxLength(4)
            .style(TextInputStyle.Short)
            .required(true)
        )
      );

    const button = new ButtonBuilder()
      .label((t) => t("verification.instructions.button"))
      .style(ButtonStyle.Primary)
      .emoji((t) => t("emojis:text-select"));

    const listener = context.getListener();

    const removeComponentsTimeout = setTimeout(() => {
      listener.removeHook(button.getCustomId());
      listener.removeHook(modal.getCustomId());
      context.reply({ components: [] });
    }, 1000 * 60 * 5);

    listener.addHook(button.getCustomId(), () => ({
      type: InteractionResponseType.Modal,
      data: modal.build(t),
    }));

    listener.addHook(modal.getCustomId(), async (interaction) => {
      interaction.setLocale(t.locale);

      const data = interaction.getData();
      const input = data.components[0].components[0].value as string;
      const code = Number.parseInt(input);

      if (Number.isNaN(code)) {
        const error = this.invalidCodeError();

        return interaction.sendFollowup({
          ...error,
          ephemeral: true,
        });
      }

      clearTimeout(removeComponentsTimeout);

      const user = await this.apiService.verifyUser(`${code}`, userId);

      if (!user) {
        const error = this.invalidCodeError();

        return interaction.sendFollowup({
          ...error,
          ephemeral: true,
        });
      }

      await this.memberService
        .addRole(SUPPORT_BOT_GUILD_ID, userId, SUPPORT_BOT_MEMBER_ROLE_ID)
        .then(() => this.apiService.updateUser(userId, { serverMember: true }))
        .catch(() => null);

      const player = await this.apiService.getPlayer(user.uuid as string);

      const displayName = this.apiService.emojiDisplayName(t, player.displayName);

      const embed = new EmbedBuilder()
        .description((t) => t("verification.successfulVerification", { displayName }))
        .color(STATUS_COLORS.success);

      context.reply({ embeds: [embed], components: [] });

      listener.removeHook(button.getCustomId());
      listener.removeHook(modal.getCustomId());
    });

    const row = new ActionRowBuilder([button]);

    return {
      embeds: [embed],
      components: [row],
      // files: [verifyGif],
    };
  }

  private getVerifyGif(): InteractionAttachment {
    const buffer = readFileSync(getAssetPath("verify.gif"));
    return { name: "verify.gif", data: buffer };
  }

  private invalidCodeError() {
    return new ErrorMessage(
      (t) => t("verification.invalidCode.title"),
      (t) => t("verification.invalidCode.description"),
      { image: this.getVerifyGif() }
    );
  }
}

@Command({ description: (t) => t("commands.verify"), cooldown: 5 })
export class LinkCommand extends VerifyCommand {}
