/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  APIUser,
  ButtonStyle,
  ChannelType,
  InteractionResponseType,
  OverwriteType,
  PermissionFlagsBits,
  TextInputStyle,
} from "discord-api-types/v10";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ChannelService,
  EmbedBuilder,
  ErrorMessage,
  IMessage,
  Interaction,
  MessageService,
  ModalBuilder,
  TextInputBuilder,
} from "@statsify/discord";
import { CommandListener } from "#lib";
import { Inject, Service } from "typedi";
import { STATUS_COLORS } from "@statsify/logger";
import { Ticket } from "@statsify/schemas";
import { config } from "@statsify/util";
import type { ReturnModelType } from "@typegoose/typegoose";

@Service()
export class TicketService {
  public constructor(
    private readonly channelService: ChannelService,
    private readonly messageService: MessageService,
    @Inject(() => Ticket) private readonly ticketModel: ReturnModelType<typeof Ticket>
  ) {}

  public async init() {
    const modal = new ModalBuilder()
      .title("Create Ticket")
      .component(
        new ActionRowBuilder().component(
          new TextInputBuilder()
            .label("What is your Minecraft username?")
            .placeholder("j4cobi")
            .minLength(1)
            .maxLength(16)
            .required(true)
            .style(TextInputStyle.Short)
        )
      )
      .component(
        new ActionRowBuilder().component(
          new TextInputBuilder()
            .label("Briefly describe the issue you are facing?")
            .placeholder("I am experience an issue where...")
            .required(true)
            .style(TextInputStyle.Paragraph)
        )
      );

    const listener = CommandListener.getInstance();

    listener.addHook("create-ticket", (interaction) => ({
      type: InteractionResponseType.Modal,
      data: modal.build(interaction.t()),
    }));

    listener.addHook(modal.getCustomId(), async (interaction) => {
      const user = interaction.getUser();
      const hasTicket = await this.checkExistingTickets(user.id);
      if (hasTicket) return;

      const data = interaction.getData();
      const username = data.components[0].components[0].value;
      const issue = data.components[1].components[0].value;

      await this.create(interaction.getGuildId() as string, user, username, issue);
    });

    //Add hooks for all tickets in the database since they may have been created before the bot was started
    const tickets = await this.ticketModel.find().select({ channel: true }).lean().exec();

    tickets.forEach((ticket) => {
      listener.addHook(ticket.channel, (interaction) =>
        this.close(interaction.getChannelId()!, "channel", interaction.getUserId())
      );

      listener.addHook(
        this.copyUsernameButtonId(ticket.channel),
        this.copyUsername.bind(this)
      );
    });
  }

  public async create(guildId: string, user: APIUser, username: string, issue: string) {
    const channel = await this.channelService.create(config("supportBot.guild"), {
      name: user.username,
      parent_id: config("supportBot.ticketCategory"),
      type: ChannelType.GuildText,
      permission_overwrites: [
        {
          type: OverwriteType.Role,
          id: guildId,
          deny: `${PermissionFlagsBits.ViewChannel}`,
        },
        {
          type: OverwriteType.Member,
          id: user.id,
          allow: `${
            PermissionFlagsBits.ViewChannel |
            PermissionFlagsBits.SendMessages |
            PermissionFlagsBits.AttachFiles |
            PermissionFlagsBits.EmbedLinks
          }`,
          deny: `${PermissionFlagsBits.MentionEveryone}`,
        },
      ],
    });

    await this.ticketModel.replaceOne(
      { owner: user.id },
      {
        owner: user.id,
        channel: channel.id,
        username,
      },
      { upsert: true }
    );

    const embed = new EmbedBuilder()
      .color(STATUS_COLORS.info)
      .title("Support")
      .description(
        "Thank you for reaching out for support! Staff will be with you shortly."
      )
      .field("Username", `\`${username}\``)
      .field("Issue", issue);

    const closeTicketButton = new ButtonBuilder()
      .label("Close Ticket")
      .style(ButtonStyle.Success)
      .customId(channel.id);

    const copyUsernameButton = new ButtonBuilder()
      .label("Copy Username")
      .style(ButtonStyle.Secondary)
      .customId(this.copyUsernameButtonId(channel.id));

    const listener = CommandListener.getInstance();

    listener.addHook(closeTicketButton.getCustomId(), (interaction) =>
      this.close(interaction.getChannelId()!, "channel", interaction.getUserId())
    );

    listener.addHook(copyUsernameButton.getCustomId(), this.copyUsername.bind(this));

    await this.messageService.send(channel.id, {
      content: `<@${user.id}>`,
      embeds: [embed],
      components: [
        new ActionRowBuilder().component(closeTicketButton).component(copyUsernameButton),
      ],
    });
  }

  /**
   *
   * @param channelIdOrOwnerId The channel id or owner's user id of the ticket
   * @param type Whether channelIdOrOwnerId is a channel id or owner's user id
   * @param userId The closer of the ticket
   * @param reason Why the ticket was closed
   * @returns whether or not the ticket was closed
   */
  public async close(
    channelIdOrOwnerId: string,
    type: "channel" | "owner",
    userId: string,
    reason = "N/A"
  ) {
    const ticket = await this.ticketModel
      .findOneAndDelete()
      .where(type)
      .equals(channelIdOrOwnerId)
      .lean()
      .exec();

    if (!ticket) return false;

    const messages = await this.channelService.getMessages(ticket.channel);
    await this.channelService.delete(ticket.channel);

    const listener = CommandListener.getInstance();
    listener.removeHook(ticket.channel);
    listener.removeHook(this.copyUsernameButtonId(ticket.channel));

    //A list of people who talked in the ticket
    const participants: Set<string> = new Set();
    participants.add(`<@${ticket.owner}>`);

    const logs: string[] = [];

    messages.forEach((m) => {
      if (!m.author.bot) participants.add(`<@${m.author.id}>`);

      const message = [
        `${m.author.username}#${m.author.discriminator}: ${m.content}`,
        ...m.attachments.map((a) => a.url),
      ].join("\n");

      logs.push(message);
    });

    const embed = new EmbedBuilder()
      .title("Ticket Resolved")
      .color(STATUS_COLORS.info)
      .description(
        [
          `Owner: <@${ticket.owner}>`,
          `Closer: <@${userId}>`,
          `Participants: ${[...participants].join(", ")}`,
          `Reason: ${reason}`,
        ]
          .map((m) => `\`•\` ${m}`)
          .join("\n")
      );

    const message: IMessage = {
      embeds: [embed],
      files: [
        {
          name: `${ticket.owner}.txt`,
          data: Buffer.from(logs.join("\n"), "utf8"),
          type: "text/plain",
        },
      ],
    };

    await this.messageService.send(config("supportBot.ticketLogsChannel"), message);

    const dm = await this.channelService.create(ticket.owner);
    await this.messageService.send(dm.id, message).catch(() => null);

    return true;
  }

  private async checkExistingTickets(userId: string) {
    const ticket = await this.ticketModel
      .findOne()
      .where("owner")
      .equals(userId)
      .lean()
      .exec();

    if (!ticket) return false;

    const error = new ErrorMessage("errors.ticketAlreadyExists");

    await this.messageService.send(ticket.channel, {
      content: `<@${userId}>`,
      ...error,
    });

    return true;
  }

  private copyUsernameButtonId(channelId: string) {
    return `${channelId}-copy-username`;
  }

  private async copyUsername(interaction: Interaction) {
    const ticket = await this.ticketModel
      .findOne()
      .where("channel")
      .equals(interaction.getChannelId())
      .select({ username: true })
      .lean()
      .exec();

    if (!ticket) return;

    interaction.sendFollowup({ content: ticket.username, ephemeral: true });
  }
}
