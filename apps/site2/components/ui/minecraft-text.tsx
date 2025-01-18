/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

const minecraftColors = [
  { code: "0", className: "text-mc-black" },
  { code: "1", className: "text-mc-dark-blue" },
  { code: "2", className: "text-mc-dark-green" },
  { code: "3", className: "text-mc-dark-aqua" },
  { code: "4", className: "text-mc-dark-red" },
  { code: "5", className: "text-mc-dark-purple" },
  { code: "6", className: "text-mc-gold" },
  { code: "7", className: "text-mc-gray" },
  { code: "8", className: "text-mc-dark-gray" },
  { code: "9", className: "text-mc-blue" },
  { code: "a", className: "text-mc-green" },
  { code: "b", className: "text-mc-aqua" },
  { code: "c", className: "text-mc-red" },
  { code: "d", className: "text-mc-pink" },
  { code: "e", className: "text-mc-yellow" },
  { code: "f", className: "text-mc-white" },
];

export function MinecraftText({ children, className }: { children: string | string[]; className?: string }) {
  const input = typeof children === "string" ? children : children.join("");
  const parts = input.split("§");

  if (input.startsWith("§")) parts.shift();

  let bold = false;
  let italic = false;
  let color = "text-mc-white";

  const elements = parts.map((part, index) => {
    const modifier = part[0];
    let text: string;

    switch (modifier) {
      case "l":
        bold = true;
        text = part.slice(1);
        break;

      case "o":
        italic = true;
        text = part.slice(1);
        break;

      case "r":
        bold = false;
        italic = false;
        color = "text-mc-white";
        text = part.slice(1);

        break;

      default: {
        const colorCode = minecraftColors.find((color) => color.code === modifier);
        if (colorCode) {
          color = colorCode.className;
          text = part.slice(1);
        } else {
          text = `§${part}`;
        }
      }
    }

    if (!text.length) return undefined;

    return <span key={index} className={`${bold ? "font-bold" : ""} ${italic ? "italic" : "not-italic"} ${color} ${className ?? ""}`}>{text}</span>;
  }).filter((element) => element !== undefined);

  return <span>{elements}</span>;
}
