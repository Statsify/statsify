/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { getTotalSize, toDecimal } from "./util.js";
import type { ElementNode, Fraction, Instruction, Percent } from "./types.js";

export const createInstructions = (
  node: ElementNode,
  component = node.component
): Instruction => {
  const hasDefinedWidth = typeof node.x.size === "number";
  const hasDefinedHeight = typeof node.y.size === "number";

  if (!hasDefinedWidth) node.x.size = node.x.minSize;
  if (!hasDefinedHeight) node.y.size = node.y.minSize;

  if (!node.children?.length) return node as Instruction;

  const side = node.style.direction === "row" ? "x" : "y";
  const otherSide = side === "x" ? "y" : "x";

  let paddlessSideLength = node[side].size as number;

  const remaining: number[] = [];

  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i];
    child.component = child.component ?? component;

    paddlessSideLength -= getTotalSize(child[side], { size: false });
  }

  let remainingSide = paddlessSideLength;

  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i];

    if (typeof child[otherSide].size === "string") {
      const size
        = (node[otherSide].size as number)
        - getTotalSize(child[otherSide], { size: false });

      child[otherSide].size
        = child[otherSide].size === "remaining"
          ? size
          : size * toDecimal(child[otherSide].size as Percent | Fraction);
    }

    if (typeof child[side].size === "string") {
      if (child[side].size === "remaining") {
        remaining.push(i);
        continue;
      }

      child[side].size
        = paddlessSideLength * toDecimal(child[side].size as Percent | Fraction);
      remainingSide -= child[side].size as number;
    }

    remainingSide -= child[side].size as number;

    node.children[i] = createInstructions(child, child.component ?? component);
  }

  if (!remaining.length) return node as Instruction;

  const remainingSideLength = remainingSide / remaining.length;

  for (const element of remaining) {
    const child = node.children[element];
    child[side].size = remainingSideLength;
    node.children[element] = createInstructions(child, child.component ?? component);
  }

  return node as Instruction;
};
