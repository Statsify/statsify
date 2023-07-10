/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  APIGuildMember,
  GatewayDispatchEvents,
  GatewayGuildMemberAddDispatchData,
} from "discord-api-types/v10";
import {
  AbstractEventListener,
  ApiService,
  EmbedBuilder,
  GuildService,
  IMessage,
  MemberService,
  MessageService,
} from "@statsify/discord";
import { STATUS_COLORS } from "@statsify/logger";
import { Service } from "typedi";
import { WelcomeProfile } from "#lib";
import { config } from "@statsify/util";
import { getBackground } from "@statsify/assets";
import { loadImage, render } from "@statsify/rendering";
import type { Image } from "skia-canvas";

const JOIN_MESSAGES = [
  "has mined into the server!",
  "has ender pearled into the server!",
  "has lagged back into the server!",
  "has respawned in the server!",
  "has connected to the server!",
  "has joined the server!",
];

const GUILD_ID = config("supportBot.guild");
const WELCOME_CHANNEL_ID = config("supportBot.welcomeChannel");
const UNVERIFIED_CHANNEL_ID = config("supportBot.unverifiedChannel");
const MEMBER_ROLE = config("supportBot.memberRole");

@Service()
export class GuildMemberAddEventListener extends AbstractEventListener<GatewayDispatchEvents.GuildMemberAdd> {
  public event = GatewayDispatchEvents.GuildMemberAdd as const;

  public constructor(
    private readonly apiService: ApiService,
    private readonly guildService: GuildService,
    private readonly messageService: MessageService,
    private readonly roleService: MemberService
  ) {
    super();
  }

  public async onEvent(data: GatewayGuildMemberAddDispatchData): Promise<void> {
    const guildId = data.guild_id;
    if (guildId !== GUILD_ID) return;

    const guild = await this.guildService.get(guildId);

    const memberId = data.user!.id;

    const user = await this.apiService.getUser(memberId);

    const message = user?.uuid
      ? await this.sendVerifiedMessage(data)
      : await this.sendUnverifiedMessage(data);

    const [avatar, background] = await Promise.all([
      this.getDiscordAvatar(data),
      getBackground("minecraft", "overall"),
    ]);

    const username = data.user!.username;

    const canvas = render(
      <WelcomeProfile
        memberCount={guild.approximate_member_count ?? 0}
        avatar={avatar}
        username={username}
        background={background}
      />
    );

    const buffer = await canvas.toBuffer("png");

    message.files = [{ name: "welcome.png", data: buffer, type: "image/png" }];

    await this.messageService.send(WELCOME_CHANNEL_ID, message);
  }

  private getDiscordAvatar(member: APIGuildMember): Promise<Image> {
    const avatar = member.user?.avatar ?? member.avatar;

    if (avatar)
      return loadImage(
        `https://cdn.discordapp.com/avatars/${member.user!.id}/${avatar}.png?size=96`
      );

    return loadImage(
      `https://cdn.discordapp.com/embed/avatars/${
        Number(member.user!.discriminator) % 5
      }.png?size=96`
    );
  }

  private async sendVerifiedMessage(member: APIGuildMember): Promise<IMessage> {
    await this.roleService.addRole(GUILD_ID, member.user!.id, MEMBER_ROLE);
    await this.apiService.updateUser(member.user!.id, { serverMember: true });

    const embed = new EmbedBuilder()
      .description(`<@${member.user!.id}> ${this.randomJoinMessage()}`)
      .image("attachment://welcome.png")
      .color(STATUS_COLORS.info);

    return { embeds: [embed] };
  }

  private async sendUnverifiedMessage(member: APIGuildMember): Promise<IMessage> {
    this.messageService.send(UNVERIFIED_CHANNEL_ID, {
      content: `<@${
        member.user!.id
      }>, run and complete \`/verify\` to get access to the rest of the discord server.`,
    });

    const embed = new EmbedBuilder()
      .description(`<@${member.user!.id}> ${this.randomJoinMessage()}`)
      .image("attachment://welcome.png")
      .color(STATUS_COLORS.info);

    return { embeds: [embed] };
  }

  private randomJoinMessage() {
    return JOIN_MESSAGES[Math.floor(Math.random() * JOIN_MESSAGES.length)];
  }
}
