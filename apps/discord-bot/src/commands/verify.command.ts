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
  LocalizeFunction,
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

const SUPPORT_BOT_GUILD_ID = config("supportBot.guild");
const SUPPORT_BOT_MEMBER_ROLE_ID = config("supportBot.memberRole");
const VERIFY_VIDEO = "https://www.youtube.com/watch?v=CCqBxdXZ9G4";

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

    const codeButton = new ButtonBuilder()
      .label((t) => t("verification.instructions.button"))
      .style(ButtonStyle.Primary)
      .emoji((t) => t("emojis:text-select"));

    const tutorialButton = this.tutorialButton();

    const listener = context.getListener();

    const removeComponentsTimeout = setTimeout(() => {
      listener.removeHook(codeButton.getCustomId());
      listener.removeHook(tutorialButton.getCustomId());
      listener.removeHook(modal.getCustomId());
      context.reply({ components: [] });
    }, 1000 * 60 * 5);

    listener.addHook(codeButton.getCustomId(), () => ({
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

      listener.removeHook(codeButton.getCustomId());
      listener.removeHook(modal.getCustomId());
    });

    const row = new ActionRowBuilder([codeButton, tutorialButton]);

    return {
      content: (t) => `# [${t("verification.instructions.title")} ${t("emojis:socials.h1.youtube")}](${VERIFY_VIDEO})\n${this.verificationSteps(t, false)}`,
      components: [row],
    };
  }

  private verificationSteps(t: LocalizeFunction, inEmbed: boolean): string {
    const minecraft = inEmbed ? t("emojis:socials.embed.minecraft") : t("emojis:socials.minecraft");
    const check = inEmbed ? t("emojis:socials.embed.check") : t("emojis:socials.check");
    const discord = inEmbed ? t("emojis:socials.embed.discord") : t("emojis:socials.discord");

    return [
      `${minecraft} ${t("verification.instructions.steps.one")}`,
      `${check} ${t("verification.instructions.steps.two")}`,
      `${discord} ${t("verification.instructions.steps.three")}`,
    ].join("\n");
  }

  private tutorialButton() {
    return new ButtonBuilder()
      .label((t) => t("verification.invalidCode.button"))
      .style(ButtonStyle.Link)
      .url(VERIFY_VIDEO)
      .emoji((t) => t("emojis:socials.youtube"));
  }

  private invalidCodeError() {
    return new ErrorMessage(
      (t) => t("verification.invalidCode.title"),
      (t) => `${t("verification.invalidCode.description")}\n\n${this.verificationSteps(t, true)}`,
      { buttons: [this.tutorialButton()] }
    );
  }
}

@Command({ description: (t) => t("commands.verify"), cooldown: 5 })
export class LinkCommand extends VerifyCommand {}
