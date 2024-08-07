/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  AbstractEventListener,
  ChannelService,
  EmbedBuilder,
  MemberService,
  MessageService,
} from "@statsify/discord";
import {
  GatewayDispatchEvents,
  GatewayGuildMemberUpdateDispatchData,
} from "discord-api-types/v10";
import { Logger, STATUS_COLORS } from "@statsify/logger";
import { Service } from "typedi";
import { User, UserTier } from "@statsify/schemas";
import { UserService } from "#services";
import { config } from "@statsify/util";

const PREMIUM_TIERS = [
  UserTier.NETHERITE,
  UserTier.EMERALD,
  UserTier.GOLD,
  UserTier.DIAMOND,
  UserTier.IRON,
] as const;

type PremiumTier = (typeof PREMIUM_TIERS)[number];

const TIER_ROLES = {
  [UserTier.NETHERITE]: config("supportBot.netheriteRole"),
  [UserTier.EMERALD]: config("supportBot.emeraldRole"),
  [UserTier.DIAMOND]: config("supportBot.diamondRole"),
  [UserTier.GOLD]: config("supportBot.goldRole"),
  [UserTier.IRON]: config("supportBot.ironRole"),
};

const PREMIUM_ROLE = config("supportBot.premiumRole");
const PATREON_ROLE = config("supportBot.patreonRole");
const NITRO_BOOSTER_ROLE = config("supportBot.nitroBoosterRole");

const PREMIUM_LOG_CHANNEL = config("supportBot.premiumLogsChannel");
const GUILD_ID = config("supportBot.guild");

@Service()
export class GuildMemberUpdateEventListener extends AbstractEventListener<GatewayDispatchEvents.GuildMemberUpdate> {
  public event = GatewayDispatchEvents.GuildMemberUpdate as const;

  private tiers: Record<PremiumTier, Set<string>>;
  private serverBoosters: Set<string>;
  private patreons: Set<string>;

  private loadedPremium: boolean;
  private readonly logger = new Logger("GuildMemberUpdateEventListener");

  public constructor(
    private readonly userService: UserService,
    private readonly roleService: MemberService,
    private readonly channelService: ChannelService,
    private readonly messageService: MessageService
  ) {
    super();

    this.tiers = {
      [UserTier.IRON]: new Set(),
      [UserTier.GOLD]: new Set(),
      [UserTier.DIAMOND]: new Set(),
      [UserTier.EMERALD]: new Set(),
      [UserTier.NETHERITE]: new Set(),
    };

    this.serverBoosters = new Set();
    this.patreons = new Set();

    this.loadedPremium = false;
  }

  public async onEvent(data: GatewayGuildMemberUpdateDispatchData): Promise<void> {
    if (!this.loadedPremium) await this.loadPremium();

    const guildId = data.guild_id;
    if (guildId !== GUILD_ID) return;

    const memberId = data.user.id;

    const currentTier = this.findTier(memberId);
    const currentRoleTier = this.findRoleTier(data.roles);

    const hasPatreonRole = data.roles.includes(PATREON_ROLE);
    const hasServerBoosterRole = data.roles.includes(NITRO_BOOSTER_ROLE);

    const isPatreon = this.patreons.has(memberId);
    const isServerBooster = this.serverBoosters.has(memberId);

    // They were a patreon but aren't anymore
    if (isPatreon && !hasPatreonRole) return this.patreonRemove(memberId);

    // They are a new patreon
    if (!isPatreon && hasPatreonRole) return this.patreonAdd(memberId);

    //They don't have premium and the role was added
    if (currentRoleTier && currentRoleTier > (currentTier ?? 0))
      return this.handlePremiumAdd(memberId, currentRoleTier);

    if (hasPatreonRole) return;

    //They were nitro boosting but stopped boosting
    if (isServerBooster && !hasServerBoosterRole)
      return this.serverBoosterRemove(memberId);

    //Has the nitro boosting role but isn't registered as a booster
    if (hasServerBoosterRole && !isServerBooster) return this.serverBoosterAdd(memberId);
  }

  private async loadPremium() {
    this.loadedPremium = true;

    const users = await this.userService.findAllPremium();

    users.forEach((user) => {
      if (user.tier in this.tiers) this.tiers[user.tier as PremiumTier].add(user.id);
      if (user.patreon) this.patreons.add(user.id);
      if (user.serverBooster) this.serverBoosters.add(user.id);
    });
  }

  private findTier(memberId: string) {
    return PREMIUM_TIERS.find((tier) => this.tiers[tier].has(memberId));
  }

  private findRoleTier(roles: string[]) {
    return PREMIUM_TIERS.find((tier) => roles.includes(TIER_ROLES[tier]));
  }

  private async serverBoosterRemove(memberId: string) {
    this.log(`REMOVING \`serverBooster\` from <@${memberId}>`);
    this.serverBoosters.delete(memberId);

    const user = await this.userService.removeServerBooster(memberId);

    //Don't remove their premium if they are a patreon
    if (user?.patreon && user.tier !== UserTier.IRON) {
      await this.roleService.removeRole(GUILD_ID, memberId, TIER_ROLES[UserTier.IRON]);
      return;
    }

    await this.handlePremiumRemove(memberId, UserTier.IRON);
  }

  private async serverBoosterAdd(memberId: string) {
    this.log(`ADDING \`serverBooster\` to <@${memberId}>`);
    this.serverBoosters.add(memberId);

    const user = await this.userService.addServerBooster(memberId);

    //Don't mess with their premium if they are a patreon
    if (!user?.patreon) return this.handlePremiumAdd(memberId, UserTier.IRON);
  }

  private async patreonRemove(memberId: string) {
    this.log(`REMOVING \`patreon\` from <@${memberId}>`);
    this.patreons.delete(memberId);

    const user = await this.userService.removePatreon(memberId);

    await this.handlePremiumRemove(
      memberId,
      (user?.tier as PremiumTier) ?? UserTier.IRON
    );
    if (user?.serverBooster) await this.handlePremiumAdd(memberId, UserTier.IRON);
  }

  private async patreonAdd(memberId: string) {
    this.log(`ADDING \`patreon\` to <@${memberId}>`);
    this.patreons.add(memberId);
    await this.userService.addPatreon(memberId);

    // Force role update to ensure they have the correct tier
    await this.roleService.addRole(GUILD_ID, memberId, PREMIUM_ROLE);
  }

  private async handlePremiumRemove(memberId: string, tier: PremiumTier) {
    if (User.isStaff(await this.userService.getTier(memberId))) return;

    this.log(`REMOVING \`${User.getTierName(tier)}\` from <@${memberId}>`);
    this.tiers[tier].delete(memberId);

    await this.userService.removePremium(memberId);
    await this.roleService.removeRole(GUILD_ID, memberId, TIER_ROLES[tier]);
    await this.roleService.removeRole(GUILD_ID, memberId, PREMIUM_ROLE);

    const { id } = await this.channelService.create(memberId);

    const tierName = User.getTierName(tier);
    const emoji = `emojis:logos.${tierName.toLowerCase()}`;

    const embed = new EmbedBuilder()
      .color(STATUS_COLORS.error)
      .title((t) => `Your ${t(emoji)} Statsify ${tierName} Expired`)
      .description(
        `You no longer have access to Statsify ${tierName} benefits. If you want to resubscribe go to our [Patreon](https://statsify.net/premium). If you believe this was a mistake, please contact us.`
      );

    this.messageService.send(id, { embeds: [embed] }).catch(() => null);
  }

  private async handlePremiumAdd(memberId: string, tier: PremiumTier) {
    if (User.isStaff(await this.userService.getTier(memberId))) return;

    this.log(`ADDING \`${User.getTierName(tier)}\` to <@${memberId}>`);
    this.tiers[tier].add(memberId);

    await this.userService.addPremium(memberId, tier);

    await this.roleService.addRole(
      GUILD_ID,
      memberId,
      TIER_ROLES[tier]
    );

    await this.roleService.addRole(GUILD_ID, memberId, PREMIUM_ROLE);

    const tierName = User.getTierName(tier);
    const emoji = `emojis:logos.${tierName.toLowerCase()}`;

    const embed = new EmbedBuilder()
      .color(STATUS_COLORS.success)
      .title(
        (t) => `Thank you for purchasing ${t(emoji)} Statsify ${User.getTierName(tier)}!`
      )
      .description(
        (t) =>
          `We are very excited to have you as a ${tierName} member. Enjoy your perks! ${t(
            "emojis:heart"
          )}`
      );

    const { id } = await this.channelService.create(memberId);

    this.messageService.send(id, { embeds: [embed] }).catch(() => null);
  }

  private log(message: string) {
    this.logger.verbose(message);

    const embed = new EmbedBuilder()
      .color(message.includes("ADDING") ? STATUS_COLORS.success : STATUS_COLORS.error)
      .description(message);

    this.messageService.send(PREMIUM_LOG_CHANNEL, { embeds: [embed] });
  }
}
