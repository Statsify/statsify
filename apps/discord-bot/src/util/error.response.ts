import { ActionRowBuilder, ButtonBuilder, ContentResponse, EmbedBuilder } from '@statsify/discord';

export class ErrorResponse extends ContentResponse {
  public constructor(title: string, description: string, buttons?: ButtonBuilder[]) {
    const embed = new EmbedBuilder().title(title).description(description).color(0xff0000);
    super({ embeds: [embed], components: buttons ? [new ActionRowBuilder(buttons)] : undefined });
  }
}
