/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  ContainerBuilder,
  type IMessage,
  type LocalizationString,
  MediaGalleryBuilder,
  TextDisplayBuilder,
} from "@statsify/discord";
import { STATUS_COLORS } from "@statsify/logger";

export function previewMessage(content: LocalizationString, name: string, data: Buffer): IMessage {
  const container = new ContainerBuilder([
    new TextDisplayBuilder(content),
    new MediaGalleryBuilder([`attachment://${name}`]),
  ]).accentColor(STATUS_COLORS.info);

  return {
    components: [container],
    files: [{ name, data, type: "image/png" }],
  };
}
