/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  AbstractCommandListener,
  ActionRowBuilder,
  ApiService,
  ButtonBuilder,
  Command,
  ContainerBuilder,
  EmbedBuilder,
  ErrorMessage,
  IMessage,
  LocalizeFunction,
  MemberService,
  ModalBuilder,
  SectionBuilder,
  TextInputBuilder,
} from "@statsify/discord";
import {
  ButtonStyle,
  InteractionResponseType,
  TextInputStyle,
} from "discord-api-types/v10";
import { STATUS_COLORS } from "@statsify/logger";
import { config } from "@statsify/util";

const SUPPORT_BOT_GUILD_ID = await config("supportBot.guild");
const SUPPORT_BOT_MEMBER_ROLE_ID = await config("supportBot.memberRole");
const VERIFY_VIDEO = "https://www.youtube.com/watch?v=e5tF89tHEsg";

const VERIFY_MODAL = new ModalBuilder()
  .title((t) => t("verification.instructions.modal.title"))
  .customId("verification-modal")
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

const VERIFY_BUTTON = new ButtonBuilder()
  .label((t) => t("verification.instructions.button"))
  .customId("verification-button")
  .style(ButtonStyle.Primary)
  .emoji((t) => t("emojis:text-select"));

const TUTORIAL_BUTTON = new ButtonBuilder()
  .label((t) => t("verification.invalidCode.button"))
  .style(ButtonStyle.Link)
  .url(VERIFY_VIDEO)
  .emoji((t) => t("emojis:socials.button.youtube"));

@Command({ description: (t) => t("commands.verify"), cooldown: 5 })
export class VerifyCommand {
  public constructor(
    private readonly apiService: ApiService,
    private readonly memberService: MemberService
  ) {}

  public async run(): Promise<IMessage> {
    const container = new ContainerBuilder([
      new SectionBuilder(
        [(t) => `## ${t("verification.instructions.title")}`, (t) => this.verificationSteps(t)],
        TUTORIAL_BUTTON
      ),
      new ActionRowBuilder([VERIFY_BUTTON]),
    ]).accentColor(STATUS_COLORS.info);

    return { components: [container] };
  }

  public registerComponentListeners(listener: AbstractCommandListener) {
    listener.addHook(VERIFY_BUTTON.getCustomId(), (interaction) => ({
      type: InteractionResponseType.Modal,
      data: VERIFY_MODAL.build(interaction.t()),
    }));

    listener.addHook(VERIFY_MODAL.getCustomId(), async (interaction) => {
      const savedUser = await this.apiService.getUser(interaction.getUserId());
      if (savedUser?.locale) interaction.setLocale(savedUser.locale);

      const t = interaction.t();
      const data = interaction.getData();
      const code = data.components[0].components[0].value as string;

      if (!/^\d{4}$/.test(code)) {
        const error = this.invalidCodeError();

        return interaction.sendFollowup({
          ...error,
          ephemeral: true,
        });
      }

      const userId = interaction.getUserId();
      const user = await this.apiService.verifyUser(code, userId);

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

      interaction.sendFollowup({ embeds: [embed], ephemeral: true });
    });
  }

  private verificationSteps(t: LocalizeFunction): string {
    return [
      `${t("emojis:socials.minecraft")} ${t("verification.instructions.steps.one")}`,
      `${t("emojis:socials.check")} ${t("verification.instructions.steps.two")}`,
      `${t("emojis:socials.discord")} ${t("verification.instructions.steps.three")}`,
    ].join("\n");
  }

  private invalidCodeError() {
    return new ErrorMessage(
      (t) => t("verification.invalidCode.title"),
      (t) => `${t("verification.invalidCode.description")}\n\n${this.verificationSteps(t)}`,
      { buttons: [TUTORIAL_BUTTON] }
    );
  }
}

@Command({ description: (t) => t("commands.verify"), cooldown: 5 })
export class LinkCommand extends VerifyCommand {}
