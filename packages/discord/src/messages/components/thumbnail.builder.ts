/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  type APIThumbnailComponent,
  ComponentType,
} from "discord-api-types/v10";

export class ThumbnailBuilder {
  #name: string;

  public constructor(name: string) {
    this.#name = name;
  }

  public build(): APIThumbnailComponent {
    return {
      type: ComponentType.Thumbnail,
      media: { url: `attachment://${this.#name}` },
    };
  }
}
