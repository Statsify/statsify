/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  type APIGuildMember,
  type APIInteraction,
  type APIInteractionResponse,
  type APIUser,
  ComponentType,
  InteractionType,
  Routes,
} from "discord-api-types/v10";
import { type IMessage, Message, getLocalizeFunction } from "#messages";
import type { API } from "@discordjs/core/http-only";
import type { RawFile } from "@discordjs/rest";

export type InteractionReply = APIInteractionResponse & { files?: RawFile[] };

export type InteractionResponder = (response: InteractionReply) => Promise<unknown>;

export class Interaction {
  private locale: string | null = null;

  // Webhook edits and followups fail with 10008 or 10015 if they reach Discord before the reply
  private readonly acknowledged = Promise.withResolvers<void>();

  public constructor(
    private readonly api: API,
    private readonly data: APIInteraction,
    private readonly applicationId: string,
    private readonly respond?: InteractionResponder
  ) {}

  public isGuildInteraction() {
    return this.data.guild_id !== null;
  }

  public isCommandInteraction() {
    return this.data.type === InteractionType.ApplicationCommand;
  }

  public isAutocompleteInteraction() {
    return this.data.type === InteractionType.ApplicationCommandAutocomplete;
  }

  public isMessageComponentInteraction() {
    return this.data.type === InteractionType.MessageComponent;
  }

  public isButtonInteraction() {
    return (
      this.isMessageComponentInteraction() &&
      this.getData().component_type === ComponentType.Button
    );
  }

  public isSelectMenuInteraction() {
    return (
      this.isMessageComponentInteraction() &&
      this.getData().component_type === ComponentType.SelectMenu
    );
  }

  public isModalInteraction() {
    return this.data.type === InteractionType.ModalSubmit;
  }

  public isPingInteraction() {
    return this.data.type === InteractionType.Ping;
  }

  public getData(): any {
    return this.data.data;
  }

  public getChannelId() {
    return this.data.channel_id;
  }

  public getGuildId() {
    return this.data.guild_id;
  }

  public getUserId() {
    return this.getUser().id;
  }

  public getUser() {
    return (this.data.user as APIUser) ?? (this.data.member as APIGuildMember).user;
  }

  public getLocale() {
    return this.locale ?? ("locale" in this.data ? this.data.locale : undefined) ?? "en-US";
  }

  public setLocale(locale: string | null) {
    this.locale = locale;
  }

  public t() {
    return getLocalizeFunction(this.getLocale());
  }

  public getCustomId(): string {
    return this.getData().custom_id;
  }

  public async reply(response: InteractionReply) {
    try {
      if (this.respond) {
        await this.respond(response);
      } else {
        const { files, ...body } = response;

        await this.api.rest.post(Routes.interactionCallback(this.data.id, this.data.token), {
          auth: false,
          body,
          files,
        });
      }
    } finally {
      this.acknowledged.resolve();
    }
  }

  public async editReply(data: Message | IMessage) {
    await this.acknowledged.promise;
    await this.api.interactions.editReply(this.applicationId, this.data.token, this.convertToEditData(data));
  }

  public async deleteReply() {
    await this.acknowledged.promise;
    await this.api.interactions.deleteReply(this.applicationId, this.data.token);
  }

  public async sendFollowup(data: Message | IMessage) {
    await this.acknowledged.promise;
    await this.api.interactions.followUp(this.applicationId, this.data.token, this.convertToApiData(data));
  }

  public async editFollowup(messageId: string, data: Message | IMessage) {
    await this.acknowledged.promise;
    await this.api.interactions.editReply(
      this.applicationId,
      this.data.token,
      this.convertToEditData(data),
      messageId
    );
  }

  public async deleteFollowup(messageId: string) {
    await this.acknowledged.promise;
    await this.api.interactions.deleteReply(this.applicationId, this.data.token, messageId);
  }

  public convertToApiData(m: Message | IMessage) {
    const message = m instanceof Message ? m : new Message(m);
    return message.toAPI(getLocalizeFunction(this.getLocale()));
  }

  // An edit can't change whether a message is ephemeral, and its flags only accept SUPPRESS_EMBEDS and IS_COMPONENTS_V2
  private convertToEditData(data: Message | IMessage) {
    return this.convertToApiData({ ...data, ephemeral: undefined });
  }
}
