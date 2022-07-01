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
  IMessage,
  MessageService,
  RoleService,
} from "@statsify/discord";
import { Service } from "typedi";
import { config } from "@statsify/util";

@Service()
export class GuildMemberAddEventListener extends AbstractEventListener<GatewayDispatchEvents.GuildMemberAdd> {
  public event = GatewayDispatchEvents.GuildMemberAdd as const;

  public constructor(
    private readonly apiService: ApiService,
    private readonly messageService: MessageService,
    private readonly roleService: RoleService
  ) {
    super();
  }

  public async onEvent(data: GatewayGuildMemberAddDispatchData): Promise<void> {
    const guildId = data.guild_id;
    if (guildId !== config("supportBot.guild")) return;

    const memberId = data.user!.id;

    const user = await this.apiService.getUser(memberId);

    const message = user?.uuid
      ? await this.sendVerifiedMessage(data)
      : await this.sendUnverifiedMessage(data);

    await this.messageService.send(config("supportBot.welcomeChannel"), message);
  }

  private async sendVerifiedMessage(member: APIGuildMember): Promise<IMessage> {
    await this.roleService.add(
      config("supportBot.guild"),
      member.user!.id,
      config("supportBot.memberRole")
    );

    return {
      content: `<@${member.user!.id}>, Welcome to the server`,
    };
  }

  private async sendUnverifiedMessage(member: APIGuildMember): Promise<IMessage> {
    return {
      content: `<@${member.user!.id}>, Head over to <#${config(
        "supportBot.unverifiedChannel"
      )}> and follow the instructions in order to verify yourself.`,
    };
  }
}
