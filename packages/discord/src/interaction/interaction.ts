import { InteractionResponseType, InteractionType } from 'discord-api-types/v10';
import type { Interaction as DiscordInteraction, RestClient } from 'tiny-discord';
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

  public defer() {
    return this.reply({}, this.getRecommendedDefferResponseType());
  }

  public reply(
    data: InteractionContent,
    responseType: InteractionResponseType = this.getRecommendendReplyResponseType()
  ) {
    return this.rest.post(`/interactions/${this.data.id}/${this.data.token}/callback`, {
      type: responseType,
      data,
    });
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

  private getRecommendendReplyResponseType() {
    if (this.isAutocompleteInteraction())
      return InteractionResponseType.ApplicationCommandAutocompleteResult;
    if (this.isCommandInteraction()) return InteractionResponseType.ChannelMessageWithSource;
    if (this.isMessageComponentInteraction()) return InteractionResponseType.UpdateMessage;

    return InteractionResponseType.Pong;
  }

  private getRecommendedDefferResponseType() {
    if (this.isCommandInteraction())
      return InteractionResponseType.DeferredChannelMessageWithSource;
    if (this.isMessageComponentInteraction()) return InteractionResponseType.DeferredMessageUpdate;

    return InteractionResponseType.Pong;
  }
}
