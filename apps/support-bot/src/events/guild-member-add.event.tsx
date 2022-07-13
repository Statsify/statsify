/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  APIGuild,
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
import { WelcomeProfile } from "#lib/welcomer.profile";
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

@Service()
export class GuildMemberAddEventListener extends AbstractEventListener<GatewayDispatchEvents.GuildMemberAdd> {
  public event = GatewayDispatchEvents.GuildMemberAdd as const;

  private guild: APIGuild;

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
    if (guildId !== config("supportBot.guild")) return;

    if (!this.guild) {
      this.guild = await this.guildService.get(guildId);
    } else {
      this.guild.approximate_member_count!++;
    }

    const memberId = data.user!.id;

    const user = await this.apiService.getUser(memberId);

    const message = user?.uuid
      ? await this.sendVerifiedMessage(data)
      : await this.sendUnverifiedMessage(data);

    const [avatar, background] = await Promise.all([
      this.getDiscordAvatar(data),
      getBackground("bedwars", "overall"),
    ]);

    const username = data.user!.username;

    const canvas = render(
      <WelcomeProfile
        memberCount={this.guild.approximate_member_count ?? 0}
        avatar={avatar}
        username={username}
        background={background}
      />
    );

    const buffer = await canvas.toBuffer("png");

    message.files = [{ name: `welcome.png`, data: buffer, type: "image/png" }];

    await this.messageService.send(config("supportBot.welcomeChannel"), message);
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
    await this.roleService.addRole(
      config("supportBot.guild"),
      member.user!.id,
      config("supportBot.memberRole")
    );

    await this.apiService.updateUser(member.user!.id, { serverMember: true });

    const embed = new EmbedBuilder()
      .description(`<@${member.user!.id}> ${this.randomJoinMessage()}`)
      .image("attachment://welcome.png")
      .color(STATUS_COLORS.info);

    return { embeds: [embed] };
  }

  private async sendUnverifiedMessage(member: APIGuildMember): Promise<IMessage> {
    const unverifiedChannel = config("supportBot.unverifiedChannel");

    this.messageService.send(unverifiedChannel, {
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
