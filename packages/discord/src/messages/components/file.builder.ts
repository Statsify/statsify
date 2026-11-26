/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type APIFileComponent, ComponentType } from "discord-api-types/v10";

export class FileBuilder {
  #name: string;

  public constructor(name: string) {
    this.#name = name;
  }

  public build(): APIFileComponent {
    return {
      type: ComponentType.File,
      file: { url: `attachment://${this.#name}` },
    };
  }
}
