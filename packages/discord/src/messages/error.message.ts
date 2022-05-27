import { IMessage, Message } from './base.message';
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

    const data: IMessage = { embeds: [embed] };

    if (buttons.length > 0) data.components = [new ActionRowBuilder(buttons)];

    super(data);
  }
}
