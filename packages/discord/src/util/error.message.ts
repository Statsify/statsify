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
import { getLogoPath } from "@statsify/assets";
import { readFileSync } from "node:fs";
import type { InteractionAttachment } from "../interaction";

interface ErrorMessageOptions {
  color?: number;
  buttons?: ButtonBuilder[];
  files?: InteractionAttachment[];
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
    { files = [], buttons = [], color = STATUS_COLORS.error }: ErrorMessageOptions = {}
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

    if (files.length > 0) {
      data.files = files;
      embed.image(`attachment://${data.files[0].name}`);
    } else {
      const errorIcon = readFileSync(getLogoPath("error", 52));
      data.files = [{ name: "error.png", data: errorIcon, type: "image/png" }];
      embed.thumbnail(`attachment://${data.files[0].name}`);
    }

    super(data);
  }
}
