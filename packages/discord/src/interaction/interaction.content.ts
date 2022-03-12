import type {
  APIAllowedMentions,
  APIAttachment,
  APIBaseComponent,
  APIEmbed,
} from 'discord-api-types/v10';

export interface InteractionAttachment {
  name: string;
  data: Buffer;
  type?: string;
}

export interface InteractionContent {
  content?: string;
  tts?: boolean;
  ephemeral?: boolean;
  mentions?: APIAllowedMentions;
  embeds?: APIEmbed[];
  files?: InteractionAttachment[];
  attachments?: APIAttachment[];
  components?: APIBaseComponent<any>[];
}
