import { APIGuildMember, InteractionType } from 'discord-api-types/v10';
import type {
  Interaction as DiscordInteraction,
  InteractionResponse,
  RestClient
} from 'tiny-discord';
import type { InteractionContent } from './interaction.content';

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

  public getCustomId(): string {
    return this.getData().custom_id;
  }

  public reply(data: InteractionResponse) {
    return this.rest.post(`/interactions/${this.data.id}/${this.data.token}/callback`, data);
  }

  public editReply(data: InteractionContent) {
    return this.rest.patch(
      `/webhooks/${this.applicationId}/${this.data.token}/messages/@original`,
      this.convertToApiData(data)
    );
  }

  public deleteReply() {
    return this.rest.delete(
      `/webhooks/${this.applicationId}/${this.data.token}/messages/@original`
    );
  }

  public sendFollowup(data: InteractionContent) {
    return this.rest.post(
      `/webhooks/${this.applicationId}/${this.data.token}`,
      this.convertToApiData(data)
    );
  }

  public editFollowup(messageId: string, data: InteractionContent) {
    return this.rest.patch(
      `/webhooks/${this.applicationId}/${this.data.token}/messages/${messageId}`,
      this.convertToApiData(data)
    );
  }

  public deleteFollowup(messageId: string) {
    return this.rest.delete(
      `/webhooks/${this.applicationId}/${this.data.token}/messages/${messageId}`
    );
  }

  public convertToApiData(data: InteractionContent) {
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
}
