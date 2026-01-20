/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Container } from "typedi";
import { FontRenderer, type TextNode } from "#font";
import type * as JSX from "#jsx";

type Text = string | number;

export interface TextProps {
  margin?: JSX.Spacing;
  children?: Text | Text[];
  align?: JSX.StyleLocation;
  color?: JSX.Fill;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  size?: number;
}

export interface TextRenderProps {
  text: TextNode[];
}

export const component: JSX.RawFC<
  TextProps,
  TextRenderProps,
  TextProps["children"]
> = ({
  margin = 6,
  children,
  align = "center",
  color = "#FFFFFF",
  bold = false,
  italic = false,
  underline = false,
  size = 2,
}) => {
  let text: string;

  switch (typeof children) {
    case "string":
      text = children;
      break;

    case "number":
      text = children.toString();
      break;

    case "object":
      text = children.join("");
      break;

    default:
      throw new Error(`Invalid text type: ${typeof children}`);
  }

  // Get a generic instance of font renderer just to lex and measure the text
  const renderer = Container.get(FontRenderer);
  const nodes = renderer.lex(text, { color, bold, italic, underline, size });

  const { width, height } = renderer.measureText(nodes);

  return {
    dimension: {
      margin,
      width,
      height,
    },
    style: { location: "center", direction: "row", align },
    props: { text: nodes },
    children: [],
  };
};

export const render: JSX.Render<TextRenderProps> = (
  ctx,
  { text },
  { x, y },
  { renderer }
) => {
  renderer.fillText(ctx, text, x, y);
};
