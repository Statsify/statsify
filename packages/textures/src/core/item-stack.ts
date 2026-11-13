/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import type { TextComponent } from "./text.js";

export interface PotionEffect {
  /** A namespaced 26.3 effect id, like "minecraft:speed" */
  id: string;
  amplifier?: number;
}

export interface ItemStack {
  /** A namespaced 26.3 item id, like "minecraft:stone_sword" */
  id: string;
  /** The item_model component, an item model definition to draw instead of the id's */
  itemModel?: string;
  /** The custom_data component, which Hypixel's 1.8.9 items carry as ExtraAttributes */
  customData?: Record<string, unknown>;
  count?: number;
  /** Durability used up, for tools and armor */
  damage?: number;
  /** Leather armor dye as 0xRRGGBB */
  color?: number;
  effects?: PotionEffect[];
  enchanted?: boolean;
  /** A player head's skin texture URL, from its profile's textures */
  skin?: string;
  /** § codes or a JSON text component */
  name?: TextComponent;
  lore?: TextComponent[];
  unbreakable?: boolean;
  hideFlags?: number;
}
