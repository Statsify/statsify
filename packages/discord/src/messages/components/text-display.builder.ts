/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type APITextDisplayComponent, ComponentType } from "discord-api-types/v10";
import { type LocalizationString, type LocalizeFunction, translateField } from "../localize.js";

export class TextDisplayBuilder {
  #content: LocalizationString;

  public constructor(content: LocalizationString) {
    this.#content = content;
  }

  public build(locale: LocalizeFunction): APITextDisplayComponent {
    return {
      type: ComponentType.TextDisplay,
      content: translateField(locale, this.#content),
    };
  }
}
