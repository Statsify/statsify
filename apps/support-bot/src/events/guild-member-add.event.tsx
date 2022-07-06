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
  GuildService,
  IMessage,
  MemberService,
  MessageService,
} from "@statsify/discord";
import { Service } from "typedi";
import { WelcomeProfile } from "#lib/welcomer.profile";
import { config } from "@statsify/util";
import { getBackground } from "@statsify/assets";
import { loadImage, render } from "@statsify/rendering";
import type { Image } from "skia-canvas";

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

    message.files = [
      { name: `welcome-${username}.png`, data: buffer, type: "image/png" },
    ];

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

    return {
      content: `<@${member.user!.id}>, Welcome to the server`,
    };
  }

  private async sendUnverifiedMessage(member: APIGuildMember): Promise<IMessage> {
    const unverifiedChannel = config("supportBot.unverifiedChannel");

    //TODO: write a better message explaining verification or maybe show the gif once its ready
    this.messageService.send(unverifiedChannel, {
      content: `<@${
        member.user!.id
      }>, Run /verify to get access to the rest of the server`,
    });

    return {
      content: `<@${
        member.user!.id
      }>, Head over to <#${unverifiedChannel}> and follow the instructions in order to verify yourself.`,
    };
  }
}
