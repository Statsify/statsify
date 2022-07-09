/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  IMessage,
  LocalizationString,
  Message,
} from "../messages";
import { STATUS_COLORS } from "@statsify/logger";
import type { APIAttachment } from "discord-api-types/v10";

interface ErrorMessageOptions {
  color?: number;
  buttons?: ButtonBuilder[];
  attachments?: APIAttachment[];
}

export class ErrorMessage extends Message {
  public constructor(localizationKey: string);
  public constructor(
    title: LocalizationString,
    description: LocalizationString,
    options?: ErrorMessageOptions
  );
  public constructor(
    titleOrKey: LocalizationString,
    description?: LocalizationString,
    {
      attachments = [],
      buttons = [],
      color = STATUS_COLORS.error,
    }: ErrorMessageOptions = {}
  ) {
    const embed = new EmbedBuilder().color(color);

    if (description) {
      embed.title(titleOrKey).description(description);
    } else {
      embed
        .title((t) => t(`${titleOrKey}.title`))
        .description((t) => t(`${titleOrKey}.description`));
    }

    const data: IMessage = { embeds: [embed] };

    if (buttons.length > 0) data.components = [new ActionRowBuilder(buttons)];
    if (attachments.length > 0) data.attachments = attachments;

    super(data);
  }
}
