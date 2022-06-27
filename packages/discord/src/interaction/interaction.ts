/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  APIGuildMember,
  APIUser,
  ComponentType,
  InteractionType,
} from "discord-api-types/v10";
import { IMessage, Message } from "../messages";
import { Logger } from "@statsify/logger";
import { getLocalizeFunction } from "../messages/localize";
import { parseDiscordError } from "../util/parse-discord-error";
import type {
  Interaction as DiscordInteraction,
  InteractionResponse,
  RestClient,
  RestRequestOptions,
} from "tiny-discord";

const logger = new Logger("Interaction Response");

export class Interaction {
  public constructor(
    private readonly rest: RestClient,
    private readonly data: DiscordInteraction,
    private readonly applicationId: string
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
    return (this.data as any).locale ?? "en-US";
  }

  public t() {
    return getLocalizeFunction(this.getLocale());
  }

  public getCustomId(): string {
    return this.getData().custom_id;
  }

  public async reply(data: InteractionResponse) {
    await this.request("Send Interaction Reply", {
      method: "post",
      path: `/interactions/${this.data.id}/${this.data.token}/callback`,
      body: data,
    });
  }

  public async editReply(data: Message | IMessage) {
    await this.request("Edit Interaction Reply", {
      method: "patch",
      path: `/webhooks/${this.applicationId}/${this.data.token}/messages/@original`,
      body: this.convertToApiData(data),
    });
  }

  public async deleteReply() {
    await this.request("Delete Interaction Reply", {
      method: "delete",
      path: `/webhooks/${this.applicationId}/${this.data.token}/messages/@original`,
    });
  }

  public async sendFollowup(data: Message | IMessage) {
    await this.request("Send Followup Interaction", {
      method: "post",
      path: `/webhooks/${this.applicationId}/${this.data.token}`,
      body: this.convertToApiData(data),
    });
  }

  public async editFollowup(messageId: string, data: Message | IMessage) {
    await this.request("Edit Followup Interaction", {
      method: "patch",
      path: `/webhooks/${this.applicationId}/${this.data.token}/messages/${messageId}`,
      body: this.convertToApiData(data),
    });
  }

  public async deleteFollowup(messageId: string) {
    await this.request("Delete Followup Interaction", {
      method: "delete",
      path: `/webhooks/${this.applicationId}/${this.data.token}/messages/${messageId}`,
    });
  }

  public convertToApiData(m: Message | IMessage) {
    const message = m instanceof Message ? m : new Message(m);
    const data = message.build(getLocalizeFunction(this.getLocale()));

    const res = {
      content: data.content,
      tts: data.tts,
      flags: data.ephemeral ? 1 << 6 : undefined,
      allowed_mentions: data.mentions,
      embeds: data.embeds,
      attachments: data.attachments,
      components: data.components,
    };

    if (data.files)
      return {
        files: data.files,
        payload_json: res,
      };

    return res;
  }

  private async request(name: string, options: RestRequestOptions) {
    const response = await this.rest.request(options);
    if (response.status >= 200 && response.status < 300) return response;

    const body = response.body as Record<string, any>;
    let message = body.message;

    if (body.errors) {
      const error = parseDiscordError(body.errors);
      message += ` | ${error}`;
    }

    logger.error(message, name);
  }
}
