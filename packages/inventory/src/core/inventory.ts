/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type PackStack, assetPath } from "./pack.js";
import { context, createCanvas, decodePng } from "./canvas.js";
import { drawTooltip, loadNames, tooltipLines } from "./tooltip.js";
import { Atlas } from "./atlas.js";
import type { IconCache } from "./icon-cache.js";
import { ItemRenderer } from "./item-renderer.js";
import type { ItemStack } from "./item-stack.js";
import { TextRenderer } from "./text.js";
import { maxDamage } from "./legacy-items.js";

export const LAYOUTS = {
  chest: { rows: 3, cols: 9 },
  "large-chest": { rows: 6, cols: 9 },
  shop: { rows: 6, cols: 9 },
  hotbar: { rows: 1, cols: 9 },
} as const;

export type InventoryLayout = keyof typeof LAYOUTS;

export interface InventorySize {
  rows: number;
  cols: number;
  /** Screen pixels per GUI pixel */
  scale: number;
  title?: string;
}

// Container geometry in GUI pixels, from the vanilla chest screen
const SLOT = 18;
const EDGE = 7;
const TITLE_HEIGHT = 17;

export const CHEST_SCREEN = "minecraft:gui/container/generic_54";

// GUI pixels across the chest screen texture, which HD packs draw larger
const CHEST_SCREEN_SIZE = 256;

// Where the chest screen's bottom edge starts, below its player inventory
const CHEST_SCREEN_BOTTOM = 215;

const slotsTop = (title?: string) => (title ? TITLE_HEIGHT : EDGE);

/** A slot's top left, in GUI pixels */
export const slotOrigin = ({ cols, title }: InventorySize, slot: number) =>
  [EDGE + (slot % cols) * SLOT, slotsTop(title) + Math.floor(slot / cols) * SLOT] as const;

/** Where the title's text starts, in GUI pixels */
export const TITLE_ORIGIN = [8, 6] as const;

/** Where a slot's count ends on the right and starts at the top, in GUI pixels */
export function countOrigin(size: InventorySize, slot: number) {
  const [x, y] = slotOrigin(size, slot);
  return [x + 18, y + 10] as const;
}

/** The slot under a point, in GUI pixels from the inventory's top left, or -1 */
export function slotAt({ rows, cols, title }: InventorySize, x: number, y: number) {
  const col = Math.floor((x - EDGE) / SLOT);
  const row = Math.floor((y - slotsTop(title)) / SLOT);
  return col >= 0 && col < cols && row >= 0 && row < rows ? row * cols + col : -1;
}

/** Fills a rectangle given in GUI pixels */
function fill(ctx: OffscreenCanvasRenderingContext2D, scale: number, x: number, y: number, w: number, h: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(x * scale, y * scale, w * scale, h * scale);
}

/** Draws containers the way Minecraft draws them, from a resource pack */
export class InventoryRenderer {
  /** Items the pack can't draw, logged once and then left out */
  private broken = new WeakSet<ItemStack>();

  private constructor(
    private itemRenderer: ItemRenderer,
    private text: TextRenderer | undefined,
    private names: Record<string, string>,
    private chestScreen?: OffscreenCanvas,
  ) {}

  public static async load(pack: PackStack | Atlas, cache?: IconCache) {
    if (pack instanceof Atlas) {
      return new InventoryRenderer(new ItemRenderer(pack, cache), undefined, pack.names, pack.texture(CHEST_SCREEN));
    }

    const chestScreen = pack.get(assetPath(CHEST_SCREEN, "textures", ".png"));

    const [text, panel] = await Promise.all([
      TextRenderer.load(pack),
      chestScreen ? decodePng(chestScreen) : undefined,
    ]);

    return new InventoryRenderer(new ItemRenderer(pack, cache), text, loadNames(pack), panel);
  }

  public async draw(slots: (ItemStack | undefined)[], size: InventorySize, tick = 0) {
    const shown = slots.slice(0, size.rows * size.cols);
    const icons = await Promise.all(shown.map((item) => item && this.icon(item, size.scale, tick)));

    const canvas = this.background(size);
    const ctx = context(canvas);
    for (const [slot, item] of shown.entries()) this.drawSlot(ctx, size, slot, item, icons[slot]);

    return canvas;
  }

  public tooltip(item: ItemStack, scale: number, tick: number) {
    if (!this.text) throw new Error("An atlas has no font, so the page draws its tooltips from lines()");
    return drawTooltip(this.text, this.lines(item), scale, tick);
  }

  /** An item's tooltip text, for pages that draw tooltips themselves */
  public lines(item: ItemStack) {
    return tooltipLines(item, this.names);
  }

  /** Whether an item's icon changes from tick to tick, or false when the pack can't draw it */
  public animates(item: ItemStack) {
    if (this.broken.has(item)) return false;

    try {
      return this.itemRenderer.animates(item);
    } catch (error) {
      this.broken.add(item);
      console.error(error);
      return false;
    }
  }

  /** An item's icon at a game tick, or undefined when the pack can't draw it */
  public async icon(item: ItemStack, scale: number, tick: number) {
    if (this.broken.has(item)) return undefined;

    try {
      return await this.itemRenderer.render(item, scale, tick);
    } catch (error) {
      this.broken.add(item);
      console.error(error);
      return undefined;
    }
  }

  /** A slot's icon, count and durability bar */
  public drawSlot(
    ctx: OffscreenCanvasRenderingContext2D,
    size: InventorySize,
    slot: number,
    item: ItemStack | undefined,
    icon: OffscreenCanvas | undefined,
  ) {
    const { scale } = size;
    const [x, y] = slotOrigin(size, slot);

    if (icon) ctx.drawImage(icon, (x + 1) * scale, (y + 1) * scale);

    if (this.text && item?.count !== undefined && item.count > 1) {
      const count = `${item.count}`;
      const [right, top] = countOrigin(size, slot);
      this.text.draw(ctx, count, (right - this.text.width(count)) * scale, top * scale, { scale });
    }

    // 1.8.9 colours the worn strip separately from the remaining durability
    const max = item ? maxDamage(item.id) : undefined;
    if (item?.damage && max) {
      const width = Math.round(13 - (item.damage * 13) / max);
      const green = Math.round(255 - (item.damage * 255) / max);
      fill(ctx, scale, x + 3, y + 14, 13, 2, "#000000");
      fill(ctx, scale, x + 3, y + 14, 12, 1, `rgb(${Math.floor((255 - green) / 4)}, 64, 0)`);
      fill(ctx, scale, x + 3, y + 14, width, 1, `rgb(${255 - green}, ${green}, 0)`);
    }
  }

  /** The panel, its slots and the title */
  private background(size: InventorySize) {
    const { rows, cols, scale, title } = size;
    const top = slotsTop(title);
    const width = EDGE * 2 + SLOT * cols;
    const height = top + SLOT * rows + EDGE;

    const canvas = createCanvas(width * scale, height * scale);
    const ctx = context(canvas);
    const panel = this.chestScreen;

    if (panel && cols === 9 && rows <= 6) {
      // The game cuts every chest height from one screen: its top, as many rows as it needs,
      // then the bottom edge, so a pack that restyles chests restyles this too
      const texel = panel.width / CHEST_SCREEN_SIZE;
      const strip = (from: number, rowsHigh: number, to: number) =>
        ctx.drawImage(panel, 0, from * texel, width * texel, rowsHigh * texel, 0, to * scale, width * scale, rowsHigh * scale);

      strip(0, top, 0);
      strip(TITLE_HEIGHT, SLOT * rows, top);
      strip(CHEST_SCREEN_BOTTOM, EDGE, top + SLOT * rows);
    } else {
      // A black outline with cut corners, a white top left and a grey bottom right
      fill(ctx, scale, 1, 0, width - 2, height, "#000000");
      fill(ctx, scale, 0, 1, width, height - 2, "#000000");
      fill(ctx, scale, 1, 1, width - 2, height - 2, "#555555");
      fill(ctx, scale, 1, 1, width - 3, height - 3, "#ffffff");
      fill(ctx, scale, 3, 3, width - 6, height - 6, "#c6c6c6");

      for (let slot = 0; slot < rows * cols; slot++) {
        const [x, y] = slotOrigin(size, slot);
        fill(ctx, scale, x, y, SLOT, SLOT, "#373737");
        fill(ctx, scale, x + 1, y + 1, SLOT - 1, SLOT - 1, "#ffffff");
        fill(ctx, scale, x + 1, y + 1, SLOT - 2, SLOT - 2, "#8b8b8b");
      }
    }

    if (title && this.text) {
      const [x, y] = TITLE_ORIGIN;
      this.text.draw(ctx, title, x * scale, y * scale, { scale, shadow: false, color: 0x40_40_40 });
    }

    return canvas;
  }
}
