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

/** Icons by the texture object they were drawn from, since render() can't wait on getItemIcon. */
export type ItemIcons = Map<ItemTexture, Canvas>;

const ICON_SIZE = 32;

export async function loadItemIcons(textures: ItemTexture[], size = ICON_SIZE): Promise<ItemIcons> {
  const icons = await Promise.all(textures.map((texture) => getItemIcon(texture, { size })));

  return new Map(
    textures.flatMap((texture, index) => {
      const icon = icons[index];
      return icon ? [[texture, icon] as const] : [];
    })
  );
}

export interface ItemSlotProps {
  icon?: Canvas;
  size?: number;
}

/** A texture the 1.8 pack doesn't have (a barrier) leaves the slot empty. */
export const ItemSlot = ({ icon, size = ICON_SIZE }: ItemSlotProps) =>
  icon ? <img image={icon} width={size} height={size} /> : <div width={size} height={size} />;
