/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import type { RemoveMethods } from '@statsify/util';
import { APIAllowedMentions, APIAttachment } from 'discord-api-types/v10';
import { InteractionAttachment, InteractionContent } from '../interaction';
import { ActionRowBuilder } from './components';
import { EmbedBuilder } from './embed';
import { LocalizationString, LocalizeFunction, translateField } from './localize';

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

  public build(locale: LocalizeFunction): InteractionContent {
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
