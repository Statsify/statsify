/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  type APIMediaGalleryComponent,
  ComponentType,
} from "discord-api-types/v10";

export class MediaGalleryBuilder {
  #names: string[];

  public constructor(names: string[]) {
    this.#names = names;
  }

  public build(): APIMediaGalleryComponent {
    return {
      type: ComponentType.MediaGallery,
      items: this.#names.map((name) => ({
        media: { url: `attachment://${name}` },
      })),
    };
  }
}
