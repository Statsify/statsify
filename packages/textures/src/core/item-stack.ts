/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import type { DyeColor } from "./tints.js";
import type { TextComponent } from "./text.js";

export interface PotionEffect {
  /** A namespaced 26.3 effect id, like "minecraft:speed" */
  id: string;
  amplifier?: number;
}

export interface BannerLayer {
  /** A banner_pattern id, like "minecraft:stripe_top" */
  pattern: string;
  color: DyeColor;
}

export interface ItemStack {
  /** A namespaced 26.3 item id, like "minecraft:stone_sword" */
  id: string;
  count?: number;
  /** Durability used up, for tools and armor */
  damage?: number;
  /** Leather armor dye as 0xRRGGBB */
  color?: number;
  effects?: PotionEffect[];
  enchanted?: boolean;
  /** A player head's skin texture URL, from its profile's textures */
  skin?: string;
  /** Bottom layer first */
  patterns?: BannerLayer[];
  /** A shield's base colour. Banners take theirs from their id */
  baseColor?: DyeColor;
  /** § codes or a JSON text component */
  name?: TextComponent;
  lore?: TextComponent[];
  /**
   * The lines under the name as the game drew them, enchantments and attributes included, like
   * a dumped kit's. Replaces lore and Unbreakable
   */
  tooltip?: TextComponent[];
  unbreakable?: boolean;
  hideFlags?: number;
}
