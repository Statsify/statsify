import type {
  APIAllowedMentions,
  APIAttachment,
  APIBaseComponent,
  APIEmbed,
} from 'discord-api-types/v10';

export interface InteractionContent {
  content?: string;
  tts?: boolean;
  ephemeral?: boolean;
  mentions?: APIAllowedMentions;
  embeds?: APIEmbed[];
  attachments?: APIAttachment[];
  components?: APIBaseComponent<any>[];
}
