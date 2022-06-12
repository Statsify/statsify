import { Logger } from '@statsify/logger';
import { APIGuildMember, ComponentType, InteractionType } from 'discord-api-types/v10';
import type {
  Interaction as DiscordInteraction,
  InteractionResponse,
  RestClient,
  RestResponse,
} from 'tiny-discord';
import { IMessage, Message } from '../messages';
import { getLocalizeFunction } from '../messages/localize';

const logger = new Logger('Interaction Response');

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
      this.isMessageComponentInteraction() && this.getData().component_type === ComponentType.Button
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

  public getUserId(): string {
    return (this.data.member as APIGuildMember)?.user?.id as string;
  }

  public getLocale() {
    return (this.data as any).locale ?? 'en-US';
  }

  public t() {
    return getLocalizeFunction(this.getLocale());
  }

  public getCustomId(): string {
    return this.getData().custom_id;
  }

  public async reply(data: InteractionResponse) {
    return this.handleError(
      await this.rest.post(`/interactions/${this.data.id}/${this.data.token}/callback`, data)
    );
  }

  public async editReply(data: Message | IMessage) {
    return this.handleError(
      await this.rest.patch(
        `/webhooks/${this.applicationId}/${this.data.token}/messages/@original`,
        this.convertToApiData(data)
      )
    );
  }

  public async deleteReply() {
    return this.handleError(
      await this.rest.delete(
        `/webhooks/${this.applicationId}/${this.data.token}/messages/@original`
      )
    );
  }

  public async sendFollowup(data: Message | IMessage) {
    return this.handleError(
      await this.rest.post(
        `/webhooks/${this.applicationId}/${this.data.token}`,
        this.convertToApiData(data)
      )
    );
  }

  public async editFollowup(messageId: string, data: Message | IMessage) {
    return this.handleError(
      await this.rest.patch(
        `/webhooks/${this.applicationId}/${this.data.token}/messages/${messageId}`,
        this.convertToApiData(data)
      )
    );
  }

  public async deleteFollowup(messageId: string) {
    return this.handleError(
      await this.rest.delete(
        `/webhooks/${this.applicationId}/${this.data.token}/messages/${messageId}`
      )
    );
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

  private handleError(response: RestResponse) {
    if (response.status >= 200 && response.status < 300) return response;

    const body = response.body as Record<string, any>;
    let message = body.message;

    if (body.errors) {
      const error = this.parseDiscordError(body.errors);
      message += ` | ${error}`;
    }

    logger.error(message);
  }

  private parseDiscordError(error: any = {}, errorKey = ''): string {
    if (typeof error.message === 'string')
      return `${errorKey.length ? `${errorKey} - ${error.code}` : `${error.code}`}: ${
        error.message
      }`.trim();

    const entries = Object.entries(error) as [string, any][];
    let message = '';

    for (const [key, value] of entries) {
      const nextKey = key.startsWith('_')
        ? errorKey
        : errorKey
        ? Number.isNaN(Number(key))
          ? `${errorKey}.${key}`
          : `${errorKey}[${key}]`
        : key;

      if (typeof value === 'string') message += value;
      else if ('_errors' in value)
        for (const error of value._errors) message += this.parseDiscordError(error, nextKey);
      else message += this.parseDiscordError(value, nextKey);
    }

    return message;
  }
}
