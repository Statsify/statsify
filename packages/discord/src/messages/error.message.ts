import { Message } from './base.message';
import { ActionRowBuilder, ButtonBuilder } from './components';
import { EmbedBuilder } from './embed';
import { LocalizationString } from './localize';

export class ErrorMessage extends Message {
  public constructor(
    title: LocalizationString,
    description: LocalizationString,
    ...buttons: ButtonBuilder[]
  ) {
    const embed = new EmbedBuilder().title(title).description(description).color(0xff0000);
    super({ embeds: [embed], components: buttons ? [new ActionRowBuilder(buttons)] : undefined });
  }
}
