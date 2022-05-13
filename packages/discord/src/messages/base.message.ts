import type { RemoveMethods } from '@statsify/util';
import { APIAllowedMentions, APIAttachment } from 'discord-api-types/v10';
import { TFunction } from 'i18next';
import { InteractionAttachment, InteractionContent } from '../interaction';
import { ActionRowBuilder } from './components';
import { EmbedBuilder } from './embed';
import { LocalizationString, translateField } from './localize';

export type IMessage = RemoveMethods<Message>;

export class Message {
  public attachments?: APIAttachment[];
  public components?: ActionRowBuilder[];
  public content?: LocalizationString;
  public embeds?: EmbedBuilder[];
  public ephemeral?: boolean;
  public files?: InteractionAttachment[];
  public mentions?: APIAllowedMentions;
  public tts?: boolean;

  public constructor(data: IMessage) {
    Object.assign(this, data);
  }

  public build(locale: TFunction): InteractionContent {
    return {
      attachments: this.attachments,
      components: this.components?.map((component) => component.build(locale)),
      content: translateField(locale, this.content),
      embeds: this.embeds?.map((embed) => embed.build(locale)),
      ephemeral: this.ephemeral,
      files: this.files,
      mentions: this.mentions,
      tts: this.tts,
    };
  }
}
