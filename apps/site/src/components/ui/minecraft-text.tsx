/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { cn } from "~/lib/util";
import type { CSSProperties, ReactNode } from "react";

const COLOR_CLASSES: Record<string, string> = {
  0: "text-mc-black",
  1: "text-mc-dark-blue",
  2: "text-mc-dark-green",
  3: "text-mc-dark-aqua",
  4: "text-mc-dark-red",
  5: "text-mc-dark-purple",
  6: "text-mc-gold",
  7: "text-mc-gray",
  8: "text-mc-dark-gray",
  9: "text-mc-blue",
  a: "text-mc-green",
  b: "text-mc-aqua",
  c: "text-mc-red",
  d: "text-mc-pink",
  e: "text-mc-yellow",
  f: "text-mc-white",
};

/** The text class for a `§` color code (`§a` → `text-mc-green`); white for anything else. */
export const colorClass = (code: string): string => COLOR_CLASSES[code.replace(/^§/, "")] ?? "text-mc-white";

/**
 * How to color text with a card's color code: the theme class for `§0`–`§f`, or an inline color for the `§#rrggbb`
 * codes some cards draw.
 */
export const colorOf = (code: string): { className?: string; style?: CSSProperties } => {
  const hex = /^§(#[\dA-Fa-f]{6})$/.exec(code)?.[1];
  return hex ? { style: { color: hex } } : { className: colorClass(code) };
};

/** The class of the first color in a formatted string, for a title that takes its value's color. */
export const leadingColorClass = (text: string): string => colorClass(/§([\da-f])/.exec(text)?.[1] ?? "");

/** The text without its `§` codes, for a page title or an alt text. */
export const plainText = (text: string): string => text.replaceAll(/§#[\dA-Fa-f]{6}|§\^\d+(?:\.\d+)?\^|§./g, "");

const HEX_COLOR = /^#[\dA-Fa-f]{6}/;
const SIZE = /^\^(\d+(?:\.\d+)?)\^/;

/** The renderer's default text size; `§^N^` is relative to it. */
const BASE_SIZE = 2;

/**
 * Renders Minecraft-formatted text the way the bot's cards do: `§0`–`§f` and `§#rrggbb` colors, `§l` bold,
 * `§o` italic, `§n` and `§u` underline, `§m` strikethrough, `§k` ignored, `§r` reset and the renderer's `§^N^` size codes.
 */
export function MinecraftText({ children, className }: { children: string | string[]; className?: string }) {
  const input = Array.isArray(children) ? children.join("") : children;
  const [plain = "", ...coded] = input.split("§");

  let bold = false;
  let italic = false;
  let underline = false;
  let strike = false;
  let colorClass = "text-mc-white";
  let hex: string | undefined;
  let size: number | undefined;

  const elements: ReactNode[] = [];

  const push = (text: string, key: number) => {
    if (text.length === 0) return;

    const style: CSSProperties = {};
    if (hex) style.color = hex;
    if (size !== undefined) style.fontSize = `${size / BASE_SIZE}em`;

    elements.push(
      <span
        key={key}
        className={cn(
          bold && "font-bold",
          italic ? "italic" : "not-italic",
          underline && "underline",
          strike && "line-through",
          hex ? undefined : colorClass,
          className
        )}
        style={style}
      >
        {text}
      </span>
    );
  };

  push(plain, 0);

  for (const [index, part] of coded.entries()) {
    const code = part[0];
    const hexMatch = HEX_COLOR.exec(part);
    const sizeMatch = SIZE.exec(part);
    let text: string;

    if (hexMatch) {
      hex = hexMatch[0];
      text = part.slice(hexMatch[0].length);
    } else if (sizeMatch) {
      size = Number(sizeMatch[1]);
      text = part.slice(sizeMatch[0].length);
    } else if (code === "l") {
      bold = true;
      text = part.slice(1);
    } else if (code === "o") {
      italic = true;
      text = part.slice(1);
    } else if (code === "n" || code === "u") {
      underline = true;
      text = part.slice(1);
    } else if (code === "k") {
      // The bot's renderer draws obfuscated text as it is.
      text = part.slice(1);
    } else if (code === "m") {
      strike = true;
      text = part.slice(1);
    } else if (code === "r") {
      bold = false;
      italic = false;
      underline = false;
      strike = false;
      hex = undefined;
      colorClass = "text-mc-white";
      text = part.slice(1);
    } else if (code !== undefined && code in COLOR_CLASSES) {
      colorClass = COLOR_CLASSES[code];
      hex = undefined;
      text = part.slice(1);
    } else {
      text = `§${part}`;
    }

    push(text, index + 1);
  }

  return <span>{elements}</span>;
}

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest;

  describe("plainText", () => {
    it("drops color, hex color, size and style codes", () => {
      expect(plainText("§b[MVP§c+] j4cobi")).toBe("[MVP+] j4cobi");
      expect(plainText("§#FF55aa§^3^Big§r §ltext")).toBe("Big text");
      expect(plainText("§^1.5^half")).toBe("half");
    });
  });
}
