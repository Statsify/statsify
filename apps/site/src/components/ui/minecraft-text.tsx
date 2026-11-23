/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { cn } from "~/lib/util";
import { parseFormatting } from "@statsify/util/format-codes";
import type { CSSProperties, ReactNode } from "react";

// Written out, not built from `minecraftColors`: Tailwind only generates the classes it finds in the source.
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
export const leadingColorClass = (text: string): string => {
  for (const { code } of parseFormatting(text)) if (code?.kind === "color") return COLOR_CLASSES[code.code];
  return "text-mc-white";
};

/** The renderer's default text size; `§^N^` is relative to it. */
const BASE_SIZE = 2;

/**
 * Renders Minecraft-formatted text the way the bot's cards do: `§0`–`§f` and `§#rrggbb` colors, `§l` bold,
 * `§o` italic, `§n` and `§u` underline, `§m` strikethrough, `§r` reset and the renderer's `§^N^` size codes, upper or
 * lower case. `§k` and unknown codes are dropped and the text after them kept.
 */
export function MinecraftText({ children, className }: { children: string | string[]; className?: string }) {
  const input = Array.isArray(children) ? children.join("") : children;

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

  for (const [index, { code, text }] of parseFormatting(input).entries()) {
    switch (code?.kind) {
      case "hex":
        hex = code.hex;
        break;

      case "size":
        size = code.size;
        break;

      case "color":
        colorClass = COLOR_CLASSES[code.code];
        hex = undefined;
        break;

      case "bold":
        bold = true;
        break;

      case "italic":
        italic = true;
        break;

      case "underline":
        underline = true;
        break;

      case "strikethrough":
        strike = true;
        break;

      case "reset":
        bold = false;
        italic = false;
        underline = false;
        strike = false;
        hex = undefined;
        colorClass = "text-mc-white";
        break;
    }

    push(text, index);
  }

  return <span>{elements}</span>;
}
