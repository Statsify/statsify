import {
  APIAllowedMentions,
  APIAttachment,
  APIBaseComponent,
  APIEmbed,
} from 'discord-api-types/v10';
import { ActionRowBuilder } from '../components';
import { EmbedBuilder } from '../embed';
import { InteractionAttachment, InteractionContent } from '../interaction';

export interface ContentResponseOptions extends Omit<InteractionContent, 'embeds' | 'components'> {
  embeds?: EmbedBuilder[];
  components?: ActionRowBuilder[];
}

export class ContentResponse implements InteractionContent {
  public content?: string;
  public tts?: boolean;
  public ephemeral?: boolean;
  public mentions?: APIAllowedMentions;
  public embeds?: APIEmbed[];
  public files?: InteractionAttachment[];
  public attachments?: APIAttachment[];
  public components?: APIBaseComponent<any>[];

  public constructor({
    attachments,
    components,
    content,
    embeds,
    ephemeral,
    files,
    mentions,
    tts,
  }: ContentResponseOptions) {
    this.attachments = attachments;
    this.components = components?.map((c) => c.build());
    this.content = content;
    this.embeds = embeds?.map((e) => e.build());
    this.ephemeral = ephemeral;
    this.files = files;
    this.mentions = mentions;
    this.tts = tts;
  }
}
