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
  ContainerBuilder,
  LocalizationString,
  MediaGalleryBuilder,
  Message,
  SectionBuilder,
  ThumbnailBuilder,
  translateField,
} from "#messages";
import { STATUS_COLORS } from "@statsify/logger";
import { getLogoPath } from "@statsify/assets";
import { readFileSync } from "node:fs";
import type { InteractionAttachment } from "#interaction";

interface ErrorMessageOptions {
  color?: number;
  buttons?: ButtonBuilder[];
  thumbnail?: InteractionAttachment;
  image?: InteractionAttachment;
}

export class ErrorMessage extends Message {
  public constructor(localizationKey: string);
  public constructor(
    title: LocalizationString,
    description: LocalizationString,
    options?: ErrorMessageOptions,
  );
  public constructor(
    titleOrKey: LocalizationString,
    description?: LocalizationString,
    {
      image,
      thumbnail,
      buttons = [],
      color = STATUS_COLORS.error,
    }: ErrorMessageOptions = {},
  ) {
    const title: LocalizationString = description ? titleOrKey : (t) => t(`${titleOrKey}.title`);
    const body: LocalizationString = description ?? ((t) => t(`${titleOrKey}.description`));

    const icon = thumbnail ?? {
      name: "error.png",
      data: readFileSync(getLogoPath("error", 52)),
      type: "image/png",
    };

    const files = [icon];

    const container = new ContainerBuilder([
      new SectionBuilder(
        [(t) => `### ${translateField(t, title)}`, body],
        new ThumbnailBuilder(`attachment://${icon.name}`)
      ),
    ]).accentColor(color);

    if (image) {
      files.push(image);
      container.component(new MediaGalleryBuilder([`attachment://${image.name}`]));
    }

    if (buttons.length > 0) container.component(new ActionRowBuilder(buttons));

    super({ components: [container], files });
  }
}
