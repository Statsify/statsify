import { APIGuildMember, InteractionType } from 'discord-api-types/v10';
import type {
  Interaction as DiscordInteraction,
  InteractionResponse,
  RestClient,
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

  public getUserId() {
    return (this.data.member as APIGuildMember)?.user?.id;
  }

  public reply(data: InteractionResponse) {
    return this.rest.post(`/interactions/${this.data.id}/${this.data.token}/callback`, data);
  }

  public editReply(data: InteractionContent) {
    return this.rest.patch(
      `/webhooks/${this.applicationId}/${this.data.token}/messages/@original`,
      data
    );
  }

  public deleteReply() {
    return this.rest.delete(
      `/webhooks/${this.applicationId}/${this.data.token}/messages/@original`
    );
  }

  public sendFollowup(data: InteractionContent) {
    return this.rest.post(`/webhooks/${this.applicationId}/${this.data.token}`, data);
  }

  public editFollowup(messageId: string, data: InteractionContent) {
    return this.rest.patch(
      `/webhooks/${this.applicationId}/${this.data.token}/messages/${messageId}`,
      data
    );
  }

  public deleteFollowup(messageId: string) {
    return this.rest.delete(
      `/webhooks/${this.applicationId}/${this.data.token}/messages/${messageId}`
    );
  }
}
