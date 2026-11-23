/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

export type FormatStyle = "bold" | "italic" | "underline" | "strikethrough" | "obfuscated" | "reset";

/** A `§` code: one of the 16 colors (`0`–`f`), a `§#rrggbb` color, a `§^N^` size, a style or reset, or none known. */
export type FormatCode =
  | { kind: "color"; code: string }
  | { kind: "hex"; hex: string }
  | { kind: "size"; size: number }
  | { kind: FormatStyle | "unknown" };

/** A code and the text after it, up to the next code. The text before the first code has none. */
export interface FormatPart {
  code?: FormatCode;
  text: string;
}

const HEX = /^#[\dA-Fa-f]{6}/;
const SIZE = /^\^(\d+(?:\.\d+)?)\^/;
const COLOR = /^[\da-f]$/;

const STYLES: Record<string, FormatStyle> = {
  l: "bold",
  o: "italic",
  n: "underline",
  u: "underline",
  m: "strikethrough",
  k: "obfuscated",
  r: "reset",
};

/** Splits Minecraft-formatted text at its `§` codes, upper or lower case. An unknown code keeps the text after it. */
export function parseFormatting(input: string): FormatPart[] {
  const [plain, ...coded] = input.split("§");
  const parts: FormatPart[] = plain ? [{ text: plain }] : [];

  for (const part of coded) {
    const hex = HEX.exec(part)?.[0];
    if (hex) {
      parts.push({ code: { kind: "hex", hex }, text: part.slice(hex.length) });
      continue;
    }

    const size = SIZE.exec(part);
    if (size) {
      parts.push({ code: { kind: "size", size: Number(size[1]) }, text: part.slice(size[0].length) });
      continue;
    }

    const char = part[0]?.toLowerCase();
    if (char === undefined) continue;

    const code: FormatCode = COLOR.test(char) ? { kind: "color", code: char } : { kind: STYLES[char] ?? "unknown" };
    parts.push({ code, text: part.slice(1) });
  }

  return parts;
}

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;

  it("splits text at its codes, in either case, keeping the text after an unknown one", () => {
    expect(parseFormatting("§bAqua §LBold")).toEqual([
      { code: { kind: "color", code: "b" }, text: "Aqua " },
      { code: { kind: "bold" }, text: "Bold" },
    ]);
    expect(parseFormatting("Hi §zthere§")).toEqual([{ text: "Hi " }, { code: { kind: "unknown" }, text: "there" }]);
    expect(parseFormatting("§#FF55aa§^1.5^big")).toEqual([
      { code: { kind: "hex", hex: "#FF55aa" }, text: "" },
      { code: { kind: "size", size: 1.5 }, text: "big" },
    ]);
  });
}
