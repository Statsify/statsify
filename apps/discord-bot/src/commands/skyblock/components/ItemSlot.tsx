/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { getItemIcon } from "@statsify/skyblock/icons";
import type { Canvas } from "skia-canvas";
import type { ItemTexture } from "@statsify/skyblock";

// Keyed by the texture object, since render() can't wait on getItemIcon.
export type ItemIcons = Map<ItemTexture, Canvas>;

const ICON_SIZE = 32;

export async function loadItemIcons(
  textures: ItemTexture[],
  size = ICON_SIZE,
): Promise<ItemIcons> {
  const canvases = await Promise.all(
    textures.map((texture) => getItemIcon(texture, { size })),
  );

  const icons: ItemIcons = new Map();
  for (const [index, texture] of textures.entries()) {
    const icon = canvases[index];
    if (icon) icons.set(texture, icon);
  }

  return icons;
}

export interface ItemSlotProps {
  icon?: Canvas;
  size?: number;
}

// A texture the 1.8 pack doesn't have, like a barrier, leaves the slot empty.
export const ItemSlot = ({ icon, size = ICON_SIZE }: ItemSlotProps) =>
  icon ? (
    <img image={icon} width={size} height={size} />
  ) : (
    <div width={size} height={size} />
  );
