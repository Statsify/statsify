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
  GatewayGuildMemberUpdateDispatchData,
} from "discord-api-types/v10";
import {
  AbstractEventListener,
  ApiService,
  ChannelService,
  MemberService,
  MessageService,
} from "@statsify/discord";
import { Logger } from "@statsify/logger";
import { Service } from "typedi";
import { User } from "@statsify/schemas";
import { UserService } from "#services";
import { config } from "@statsify/util";

@Service()
export class GuildMemberUpdateEventListener extends AbstractEventListener<GatewayDispatchEvents.GuildMemberUpdate> {
  public event = GatewayDispatchEvents.GuildMemberUpdate as const;

  private premium: string[];
  private nitroBoosters: string[];
  private loadedPremium: boolean;
  private readonly logger = new Logger("GuildMemberUpdateEventListener");

  public constructor(
    private readonly apiService: ApiService,
    private readonly userService: UserService,
    private readonly roleService: MemberService,
    private readonly channelService: ChannelService,
    private readonly messageService: MessageService
  ) {
    super();

    this.premium = [];
    this.nitroBoosters = [];
    this.loadedPremium = false;
  }

  public async onEvent(data: GatewayGuildMemberUpdateDispatchData): Promise<void> {
    if (!this.loadedPremium) await this.loadPremium();

    const guildId = data.guild_id;
    if (guildId !== config("supportBot.guild")) return;

    const memberId = data.user.id;
    const premiumRole = config("supportBot.premiumRole");
    const nitroBoosterRole = config("supportBot.nitroBoosterRole");

    const isMemberPremium = this.premium.includes(memberId);
    const hasPremiumRole = data.roles.includes(premiumRole);

    //They had premium and the role was removed
    if (isMemberPremium && !hasPremiumRole) {
      return this.handlePremiumRemove(data as APIGuildMember);
    }

    //They don't have premium and the role was added
    if (hasPremiumRole && !isMemberPremium) {
      return this.handlePremiumAdd(data as APIGuildMember);
    }

    const isMemberNitroBooster = this.nitroBoosters.includes(memberId);
    const hasNitroBoosterRole = data.roles.includes(nitroBoosterRole);

    //They were nitro boosting but stopped boosting
    if (isMemberNitroBooster && !hasNitroBoosterRole) {
      return this.handleNitroBoosterRemove(data as APIGuildMember);
    }

    //Has the nitro boosting role but isn't registered as a booster
    if (hasNitroBoosterRole && !isMemberNitroBooster) {
      return this.handleNitroBoosterAdd(data as APIGuildMember);
    }
  }

  private async loadPremium() {
    this.loadedPremium = true;

    const [premiumUsers, nitroUsers] = await Promise.all([
      this.userService.findAllPremium(),
      this.userService.findAllNitroBoosters(),
    ]);

    this.premium.push(...premiumUsers);
    this.nitroBoosters.push(...nitroUsers);
  }

  private async handlePremiumRemove(member: APIGuildMember) {
    const memberId = member.user!.id;
    this.logger.verbose(`Removing premium from ${memberId}`);

    this.premium = this.premium.filter((m) => m !== memberId);

    await this.userService.removePremiumUser(memberId);

    //TODO(jacobk999): Send some sort of message telling the user their premium ran out?
    const { id } = await this.channelService.create(memberId);

    this.messageService
      .send(id, { content: "You lost your statsify premium" })
      .catch(() => null);
  }

  private async handlePremiumAdd(member: APIGuildMember) {
    const user = await this.apiService.getUser(member.user!.id);

    // The user already is premium or is staff, don't mass with their tier
    if (User.isPremium(user)) return;

    const memberId = member.user!.id;
    this.logger.verbose(`Adding premium to ${memberId}`);

    this.premium.push(memberId);

    await this.userService.addPremiumUser(memberId);

    const premiumInfoChannel = config("supportBot.premiumInfoChannel");

    await this.messageService
      .send(premiumInfoChannel, { content: `<@${memberId}>` })
      .then((m) => this.messageService.delete(premiumInfoChannel, m.id));
  }

  private async handleNitroBoosterRemove(member: APIGuildMember) {
    const memberId = member.user!.id;
    this.logger.verbose(`Removing nitro boost perks from ${memberId}`);

    this.nitroBoosters = this.nitroBoosters.filter((m) => m !== memberId);

    await this.userService.removeNitroBoosterUser(memberId);

    await this.roleService.removeRole(
      config("supportBot.guild"),
      memberId,
      config("supportBot.premiumRole")
    );
  }

  private async handleNitroBoosterAdd(member: APIGuildMember) {
    const memberId = member.user!.id;
    this.logger.verbose(`Adding nitro boost perks from ${memberId}`);

    this.nitroBoosters.push(memberId);

    await this.userService.addNitroBoosterUser(memberId);

    await this.roleService.addRole(
      config("supportBot.guild"),
      memberId,
      config("supportBot.premiumRole")
    );
  }
}
