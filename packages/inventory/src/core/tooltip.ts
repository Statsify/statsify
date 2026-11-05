/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import type { TextComponent, TextRenderer } from "./text.js";
import type { ItemStack } from "./item-stack.js";
import type { PackStack } from "./pack.js";
import { context, createCanvas } from "./canvas.js";
import { legacyName } from "./legacy-items.js";

// The HideFlags bit that hides Unbreakable
const HIDE_UNBREAKABLE = 4;

const NAMES = "assets/minecraft/lang/en_us.json";

/** The pack's English names, for items without a custom name */
export function loadNames(stack: PackStack) {
  const names = stack.json<Record<string, string>>(NAMES);
  if (!names) throw new Error(`${NAMES} isn't in the pack`);
  return names;
}

// Legacy text takes the default style as § codes; a component gets it as a parent to inherit
const prefixed = (text: TextComponent, codes: string, style: { color?: string; italic?: boolean }): TextComponent =>
  typeof text === "string" ? `${codes}${text}` : { text: "", ...style, extra: [text] };

/** An unnamed item's name: 1.8's where it had one, since Hypixel players see those, else the pack's */
function plainName(item: ItemStack, names: Record<string, string>) {
  const legacy = legacyName(item.id);
  // 1.8 makes only common items aqua when enchanted
  if (legacy) return item.enchanted && legacy.startsWith("§f") ? `§b${legacy.slice(2)}` : legacy;

  const path = item.id.replace(/^minecraft:/, "");
  const key = names[`item.minecraft.${path}`] ? `item.minecraft.${path}` : `block.minecraft.${path}`;
  return `${item.enchanted ? "§b" : ""}${names[key] ?? key}`;
}

/**
 * An item's tooltip lines in 1.8's order: the name, the lore in dark purple italics, then
 * Unbreakable unless HideFlags hides it. Renamed items start italic, which a colour code at
 * the start of the name clears, as in game.
 */
export function tooltipLines(item: ItemStack, names: Record<string, string>): TextComponent[] {
  const lines: TextComponent[] = [
    item.name === undefined ? plainName(item, names) : prefixed(item.name, "§o", { italic: true }),
  ];

  for (const line of item.lore ?? []) lines.push(prefixed(line, "§5§o", { color: "dark_purple", italic: true }));
  if (item.unbreakable && !((item.hideFlags ?? 0) & HIDE_UNBREAKABLE)) lines.push("§9Unbreakable");

  return lines;
}

const BACKGROUND = "rgba(16, 0, 16, 0.941)";
const BORDER_TOP = "rgba(80, 0, 255, 0.314)";
const BORDER_BOTTOM = "rgba(40, 0, 127, 0.314)";

/** How far the tooltip box reaches past its text on each side, in GUI pixels */
const TOOLTIP_PADDING = 4;

/** Draws a tooltip the way 1.8's drawHoveringText does */
export function drawTooltip(text: TextRenderer, lines: TextComponent[], scale: number, tick: number) {
  const width = Math.max(...lines.map((line) => text.width(line)));
  const height = 8 + (lines.length > 1 ? 2 + (lines.length - 1) * 10 : 0);

  const canvas = createCanvas((width + 2 * TOOLTIP_PADDING) * scale, (height + 2 * TOOLTIP_PADDING) * scale);
  const ctx = context(canvas);

  // Rectangles from x1, y1 to x2, y2 around the text's top left, in GUI pixels
  const x = TOOLTIP_PADDING;
  const y = TOOLTIP_PADDING;

  const rect = (x1: number, y1: number, x2: number, y2: number, top: string, bottom = top) => {
    const gradient = ctx.createLinearGradient(0, y1 * scale, 0, y2 * scale);
    gradient.addColorStop(0, top);
    gradient.addColorStop(1, bottom);
    ctx.fillStyle = gradient;
    ctx.fillRect(x1 * scale, y1 * scale, (x2 - x1) * scale, (y2 - y1) * scale);
  };

  rect(x - 3, y - 4, x + width + 3, y - 3, BACKGROUND);
  rect(x - 3, y + height + 3, x + width + 3, y + height + 4, BACKGROUND);
  rect(x - 3, y - 3, x + width + 3, y + height + 3, BACKGROUND);
  rect(x - 4, y - 3, x - 3, y + height + 3, BACKGROUND);
  rect(x + width + 3, y - 3, x + width + 4, y + height + 3, BACKGROUND);

  rect(x - 3, y - 2, x - 2, y + height + 2, BORDER_TOP, BORDER_BOTTOM);
  rect(x + width + 2, y - 2, x + width + 3, y + height + 2, BORDER_TOP, BORDER_BOTTOM);
  rect(x - 3, y - 3, x + width + 3, y - 2, BORDER_TOP);
  rect(x - 3, y + height + 2, x + width + 3, y + height + 3, BORDER_BOTTOM);

  for (const [index, line] of lines.entries()) {
    const top = y + index * 10 + (index > 0 ? 2 : 0);
    text.draw(ctx, line, x * scale, top * scale, { scale, tick });
  }

  return canvas;
}
