/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type APISectionComponent, ComponentType } from "discord-api-types/v10";
import type { LocalizationString, LocalizeFunction } from "../localize.js";
import { TextDisplayBuilder } from "./text-display.builder.js";
import type { ButtonBuilder } from "./button.builder.js";
import type { ThumbnailBuilder } from "./thumbnail.builder.js";

export class SectionBuilder {
  #texts: TextDisplayBuilder[];
  #accessory: ButtonBuilder | ThumbnailBuilder;

  /**
   * @param texts One to three blocks of text shown beside the accessory
   */
  public constructor(texts: LocalizationString[], accessory: ButtonBuilder | ThumbnailBuilder) {
    this.#texts = texts.map((text) => new TextDisplayBuilder(text));
    this.#accessory = accessory;
  }

  public build(locale: LocalizeFunction): Omit<APISectionComponent, "accessory"> & {
    accessory: ReturnType<ButtonBuilder["build"] | ThumbnailBuilder["build"]>;
  } {
    return {
      type: ComponentType.Section,
      components: this.#texts.map((text) => text.build(locale)),
      accessory: this.#accessory.build(locale),
    };
  }
}
