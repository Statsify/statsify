/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import type {
  APIAllowedMentions,
  APIAttachment,
  APIBaseComponent,
  APIEmbed,
} from "discord-api-types/v10";
import type { LocalizationString } from "#messages";

export interface InteractionAttachment {
  name: string;
  data: Buffer;
  type?: string;
  /** Alt text */
  description?: LocalizationString;
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
