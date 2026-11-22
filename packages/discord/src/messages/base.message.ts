/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { APIAllowedMentions, APIAttachment, MessageFlags } from "discord-api-types/v10";
import { ActionRowBuilder, type ContainerBuilder, type ContainerComponent } from "./components/index.js";
import { EmbedBuilder } from "./embed.js";
import { InteractionAttachment, InteractionContent } from "#interaction";
import { LocalizationString, LocalizeFunction, translateField } from "./localize.js";
import type { RemoveMethods } from "@statsify/util";

export type IMessage = RemoveMethods<Message>;

export type MessageComponent = ContainerBuilder | ContainerComponent;

// IS_COMPONENTS_V2 rejects `content` and `embeds`, and a message can't drop the flag once sent
export const isComponentsV2 = (
  message: IMessage
): message is IMessage & { components: MessageComponent[] } =>
  message.components?.some((component) => !(component instanceof ActionRowBuilder)) ?? false;

export class Message {
  public attachments?: APIAttachment[];
  public components?: MessageComponent[];
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

  public toAPI(locale: LocalizeFunction) {
    const data = this.build(locale);

    const v2 = isComponentsV2(this);

    let flags = 0;
    if (data.ephemeral) flags |= MessageFlags.Ephemeral;
    if (v2) flags |= MessageFlags.IsComponentsV2;

    return {
      content: data.content,
      tts: data.tts,
      flags: flags || undefined,
      // Unlike embeds, text displays ping what they mention, and some show user input
      allowed_mentions: data.mentions ?? (v2 ? { parse: [] } : undefined),
      embeds: data.embeds,
      attachments: data.attachments,
      components: data.components,
      files: data.files?.map(({ name, data, type }) => ({ name, data, contentType: type })),
    };
  }
}
