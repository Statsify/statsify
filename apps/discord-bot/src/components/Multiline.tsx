/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { useChildren } from "@statsify/rendering";

export interface MultilineProps {
  children: JSX.IntrinsicElements["text"]["children"];
  align?: JSX.IntrinsicElements["text"]["align"];
  margin?: number;
}

export const Multiline = ({ children, align, margin = 1 }: MultilineProps) => (
  <>
    {useChildren(children)
      .join(" ")
      .split("\n")
      .map((t) => (
        <text align={align} margin={margin}>
          {t}
        </text>
      ))}
  </>
);
