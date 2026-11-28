/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import type { TextComponent } from "./text.js";

export interface PotionEffect {
  id: string;
  amplifier?: number;
}

export interface ItemStack {
  id: string;
  /** The item_model component, an item model definition to draw instead of the id's */
  itemModel?: string;
  /** The custom_data component, which Hypixel's 1.8.9 items carry as ExtraAttributes */
  customData?: Record<string, unknown>;
  count?: number;
  damage?: number;
  color?: number;
  effects?: PotionEffect[];
  enchanted?: boolean;
  skin?: string;
  name?: TextComponent;
  lore?: TextComponent[];
  unbreakable?: boolean;
  hideFlags?: number;
}
