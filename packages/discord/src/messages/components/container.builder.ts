/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type APIContainerComponent, ComponentType } from "discord-api-types/v10";
import type { ActionRowBuilder } from "./action-row.builder.js";
import type { FileBuilder } from "./file.builder.js";
import type { LocalizeFunction } from "../localize.js";
import type { MediaGalleryBuilder } from "./media-gallery.builder.js";
import type { SectionBuilder } from "./section.builder.js";
import type { SeparatorBuilder } from "./separator.builder.js";
import type { TextDisplayBuilder } from "./text-display.builder.js";

export type ContainerComponent =
  | ActionRowBuilder
  | FileBuilder
  | MediaGalleryBuilder
  | SectionBuilder
  | SeparatorBuilder
  | TextDisplayBuilder;

export class ContainerBuilder {
  #components: ContainerComponent[];
  #accentColor?: number;

  public constructor(components: ContainerComponent[] = []) {
    this.#components = components;
  }

  public component(component: ContainerComponent): this {
    this.#components.push(component);
    return this;
  }

  public accentColor(color: number): this {
    this.#accentColor = color;
    return this;
  }

  public build(locale: LocalizeFunction): Omit<APIContainerComponent, "components"> & {
    components: ReturnType<ContainerComponent["build"]>[];
  } {
    return {
      type: ComponentType.Container,
      accent_color: this.#accentColor,
      components: this.#components.map((component) => component.build(locale)),
    };
  }
}
