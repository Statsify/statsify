/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  GatewayChannelCreateDispatchData,
  GatewayChannelDeleteDispatchData,
  GatewayChannelPinsUpdateDispatchData,
  GatewayChannelUpdateDispatchData,
  GatewayDispatchEvents,
  GatewayGuildBanAddDispatchData,
  GatewayGuildBanRemoveDispatchData,
  GatewayGuildCreateDispatchData,
  GatewayGuildDeleteDispatchData,
  GatewayGuildEmojisUpdateDispatchData,
  GatewayGuildIntegrationsUpdateDispatchData,
  GatewayGuildMemberAddDispatchData,
  GatewayGuildMemberRemoveDispatchData,
  GatewayGuildMemberUpdateDispatchData,
  GatewayGuildMembersChunkDispatchData,
  GatewayGuildRoleCreateDispatchData,
  GatewayGuildRoleDeleteDispatchData,
  GatewayGuildRoleUpdateDispatchData,
  GatewayGuildScheduledEventCreateDispatchData,
  GatewayGuildScheduledEventDeleteDispatchData,
  GatewayGuildScheduledEventUpdateDispatchData,
  GatewayGuildScheduledEventUserAddDispatchData,
  GatewayGuildScheduledEventUserRemoveDispatchData,
  GatewayGuildStickersUpdateDispatchData,
  GatewayGuildUpdateDispatchData,
  GatewayIntegrationCreateDispatchData,
  GatewayIntegrationDeleteDispatchData,
  GatewayIntegrationUpdateDispatchData,
  GatewayInteractionCreateDispatchData,
  GatewayInviteCreateDispatchData,
  GatewayInviteDeleteDispatchData,
  GatewayMessageCreateDispatchData,
  GatewayMessageDeleteBulkDispatchData,
  GatewayMessageDeleteDispatchData,
  GatewayMessageReactionAddDispatchData,
  GatewayMessageReactionRemoveAllDispatchData,
  GatewayMessageReactionRemoveDispatchData,
  GatewayMessageReactionRemoveEmojiDispatchData,
  GatewayMessageUpdateDispatchData,
  GatewayPresenceUpdateDispatchData,
  GatewayReadyDispatchData,
  GatewayStageInstanceCreateDispatchData,
  GatewayStageInstanceDeleteDispatchData,
  GatewayStageInstanceUpdateDispatchData,
  GatewayThreadCreateDispatchData,
  GatewayThreadDeleteDispatchData,
  GatewayThreadListSyncDispatchData,
  GatewayThreadMemberUpdateDispatchData,
  GatewayThreadMembersUpdateDispatchData,
  GatewayThreadUpdateDispatchData,
  GatewayTypingStartDispatchData,
  GatewayUserUpdateDispatchData,
  GatewayVoiceServerUpdateDispatchData,
  GatewayVoiceStateUpdateDispatchData,
  GatewayWebhooksUpdateDispatchData,
} from "discord-api-types/v10";

export interface GatewayEventDispatchData {
  [GatewayDispatchEvents.ChannelCreate]: GatewayChannelCreateDispatchData;
  [GatewayDispatchEvents.ChannelDelete]: GatewayChannelDeleteDispatchData;
  [GatewayDispatchEvents.ChannelPinsUpdate]: GatewayChannelPinsUpdateDispatchData;
  [GatewayDispatchEvents.ChannelUpdate]: GatewayChannelUpdateDispatchData;
  [GatewayDispatchEvents.GuildBanAdd]: GatewayGuildBanAddDispatchData;
  [GatewayDispatchEvents.GuildBanRemove]: GatewayGuildBanRemoveDispatchData;
  [GatewayDispatchEvents.GuildCreate]: GatewayGuildCreateDispatchData;
  [GatewayDispatchEvents.GuildDelete]: GatewayGuildDeleteDispatchData;
  [GatewayDispatchEvents.GuildEmojisUpdate]: GatewayGuildEmojisUpdateDispatchData;
  [GatewayDispatchEvents.GuildIntegrationsUpdate]: GatewayGuildIntegrationsUpdateDispatchData;
  [GatewayDispatchEvents.GuildMemberAdd]: GatewayGuildMemberAddDispatchData;
  [GatewayDispatchEvents.GuildMemberRemove]: GatewayGuildMemberRemoveDispatchData;
  [GatewayDispatchEvents.GuildMembersChunk]: GatewayGuildMembersChunkDispatchData;
  [GatewayDispatchEvents.GuildMemberUpdate]: GatewayGuildMemberUpdateDispatchData;
  [GatewayDispatchEvents.GuildRoleCreate]: GatewayGuildRoleCreateDispatchData;
  [GatewayDispatchEvents.GuildRoleDelete]: GatewayGuildRoleDeleteDispatchData;
  [GatewayDispatchEvents.GuildRoleUpdate]: GatewayGuildRoleUpdateDispatchData;
  [GatewayDispatchEvents.GuildStickersUpdate]: GatewayGuildStickersUpdateDispatchData;
  [GatewayDispatchEvents.GuildUpdate]: GatewayGuildUpdateDispatchData;
  [GatewayDispatchEvents.IntegrationCreate]: GatewayIntegrationCreateDispatchData;
  [GatewayDispatchEvents.IntegrationDelete]: GatewayIntegrationDeleteDispatchData;
  [GatewayDispatchEvents.IntegrationUpdate]: GatewayIntegrationUpdateDispatchData;
  [GatewayDispatchEvents.InteractionCreate]: GatewayInteractionCreateDispatchData;
  [GatewayDispatchEvents.InviteCreate]: GatewayInviteCreateDispatchData;
  [GatewayDispatchEvents.InviteDelete]: GatewayInviteDeleteDispatchData;
  [GatewayDispatchEvents.MessageCreate]: GatewayMessageCreateDispatchData;
  [GatewayDispatchEvents.MessageDelete]: GatewayMessageDeleteDispatchData;
  [GatewayDispatchEvents.MessageDeleteBulk]: GatewayMessageDeleteBulkDispatchData;
  [GatewayDispatchEvents.MessageReactionAdd]: GatewayMessageReactionAddDispatchData;
  [GatewayDispatchEvents.MessageReactionRemove]: GatewayMessageReactionRemoveDispatchData;
  [GatewayDispatchEvents.MessageReactionRemoveAll]: GatewayMessageReactionRemoveAllDispatchData;
  [GatewayDispatchEvents.MessageReactionRemoveEmoji]: GatewayMessageReactionRemoveEmojiDispatchData;
  [GatewayDispatchEvents.MessageUpdate]: GatewayMessageUpdateDispatchData;
  [GatewayDispatchEvents.PresenceUpdate]: GatewayPresenceUpdateDispatchData;
  [GatewayDispatchEvents.StageInstanceCreate]: GatewayStageInstanceCreateDispatchData;
  [GatewayDispatchEvents.StageInstanceDelete]: GatewayStageInstanceDeleteDispatchData;
  [GatewayDispatchEvents.StageInstanceUpdate]: GatewayStageInstanceUpdateDispatchData;
  [GatewayDispatchEvents.Ready]: GatewayReadyDispatchData;
  [GatewayDispatchEvents.ThreadCreate]: GatewayThreadCreateDispatchData;
  [GatewayDispatchEvents.ThreadDelete]: GatewayThreadDeleteDispatchData;
  [GatewayDispatchEvents.ThreadListSync]: GatewayThreadListSyncDispatchData;
  [GatewayDispatchEvents.ThreadMembersUpdate]: GatewayThreadMembersUpdateDispatchData;
  [GatewayDispatchEvents.ThreadMemberUpdate]: GatewayThreadMemberUpdateDispatchData;
  [GatewayDispatchEvents.ThreadUpdate]: GatewayThreadUpdateDispatchData;
  [GatewayDispatchEvents.TypingStart]: GatewayTypingStartDispatchData;
  [GatewayDispatchEvents.UserUpdate]: GatewayUserUpdateDispatchData;
  [GatewayDispatchEvents.VoiceServerUpdate]: GatewayVoiceServerUpdateDispatchData;
  [GatewayDispatchEvents.VoiceStateUpdate]: GatewayVoiceStateUpdateDispatchData;
  [GatewayDispatchEvents.WebhooksUpdate]: GatewayWebhooksUpdateDispatchData;
  [GatewayDispatchEvents.GuildScheduledEventCreate]: GatewayGuildScheduledEventCreateDispatchData;
  [GatewayDispatchEvents.GuildScheduledEventUpdate]: GatewayGuildScheduledEventUpdateDispatchData;
  [GatewayDispatchEvents.GuildScheduledEventDelete]: GatewayGuildScheduledEventDeleteDispatchData;
  [GatewayDispatchEvents.GuildScheduledEventUserAdd]: GatewayGuildScheduledEventUserAddDispatchData;
  [GatewayDispatchEvents.GuildScheduledEventUserRemove]: GatewayGuildScheduledEventUserRemoveDispatchData;
}

export abstract class AbstractEventListener<T extends GatewayDispatchEvents> {
  public abstract event: T;

  public abstract onEvent(
    data: T extends keyof GatewayEventDispatchData ? GatewayEventDispatchData[T] : never
  ): void | Promise<void>;
}
