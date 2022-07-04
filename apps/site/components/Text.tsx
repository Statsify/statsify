/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { CSSProperties } from "react";

const color = (color: string): CSSProperties => ({
  color,
  filter: `brightness(405%) drop-shadow(10px 10px 0px ${color})`,
});

const modifiers: Record<string, CSSProperties> = {
  "0": color("#000000"),
  "1": color("#00002A"),
  "2": color("#002A00"),
  "3": color("#002A2A"),
  "4": color("#2A0000"),
  "5": color("#2A002A"),
  "6": color("#3F2A00"),
  "7": color("#2A2A2A"),
  "8": color("#151515"),
  "9": color("#15153F"),
  a: color("#153F15"),
  b: color("#153F3F"),
  c: color("#3F1515"),
  d: color("#3F153F"),
  e: color("#3F3F15"),
  f: color("#3F3F3F"),
  l: { fontWeight: "bold" },
  o: { fontStyle: "initial" },
  m: { textDecoration: "line-through" },
  n: { textDecoration: "underline" },
  r: {
    ...color("#3F3F3F"),
    fontWeight: "normal",
    fontStyle: "normal",
    textDecoration: "none",
  },
};

export interface TextProps {
  children: string | string[];
  size?: number;
}

export const Text = ({ size = 2, children }: TextProps) => {
  if (typeof children !== "string") children = children.join("\n");
  if (!children.startsWith("§")) children = `§0${children}`;

  //TODO: load the minecraft font somewhere
  let style: CSSProperties = {
    fontFamily: "Minecraft",
    fontSize: `${size * 10}px`,
    ...modifiers["0"],
  };

  return (
    <span>
      {children.split("§").map((p, i) => {
        if (p.length === 0) return "";

        const modifier = modifiers[p[0]];
        style = { ...style, ...modifier };
        style.filter = `brightness(405%) drop-shadow(${size}px ${size}px 0px ${style.color})`;

        return (
          <span style={style} key={i}>
            {p.slice(1)}
          </span>
        );
      })}
    </span>
  );
};
