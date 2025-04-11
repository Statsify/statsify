/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  type CompleteSpacing,
  type ElementNode,
  type Fraction,
  type IntrinsicElement,
  type Percent,
  type RawElement,
  type Spacing,
  getTotalSize,
  toDecimal,
} from "#jsx";

const spacingToCompleteSpacing = (spacing?: Spacing): CompleteSpacing => {
  if (typeof spacing === "number") {
    return {
      left: spacing,
      right: spacing,
      bottom: spacing,
      top: spacing,
    };
  }

  return {
    top: spacing?.top ?? 0,
    bottom: spacing?.bottom ?? 0,
    left: spacing?.left ?? 0,
    right: spacing?.right ?? 0,
  };
};

type Side = "x" | "y";

const normalizeNode = (node: ElementNode, side: Side, other: Side) => {
  const sideType = typeof node[side].size;
  const otherType = typeof node[other].size;

  if (
    sideType === "undefined" ||
    (sideType === "number" && (node[side].size as number) < node[side].minSize)
  )
    node[side].size = node[side].minSize;

  if (
    otherType === "undefined" ||
    (otherType === "number" && (node[other].size as number) < node[other].minSize)
  )
    node[other].size = node[other].minSize;

  return node;
};

interface SideData {
  percentSpaceLeft: number;
  /**
   * The length of all the padding and margin of all the children
   */
  paddedLength: number;
  /**
   * Length of the children who do not have percentage widths
   */
  staticLength: number;
  highestPixelToPercentRatio: number;
}

const gatherSideData = (child: ElementNode, side: Side, data: SideData) => {
  // There can't be anymore children if whole is already 0
  if (data.percentSpaceLeft === 0) throw new Error("Space required exceeds 100%");

  const paddingAndMargin = getTotalSize(child[side], { size: false });
  data.paddedLength += paddingAndMargin;

  const minSize = child[side].minSize;

  if (typeof child[side].size === "string" && child[side].size !== "remaining") {
    const percent = toDecimal(child[side].size as Percent | Fraction);
    data.percentSpaceLeft -= percent;
    if (data.percentSpaceLeft < 0) throw new Error("Space required exceeds 100%");

    const pixelPercentRatio = minSize / percent;

    if (pixelPercentRatio > data.highestPixelToPercentRatio)
      data.highestPixelToPercentRatio = pixelPercentRatio;
  } else {
    data.staticLength += minSize;
  }

  return data;
};

const processSideData = (data: SideData) => {
  if (!data.percentSpaceLeft) return data.highestPixelToPercentRatio + data.paddedLength;

  const remainingPixelPercentRatio = data.staticLength / data.percentSpaceLeft;

  return (
    (Math.max(data.highestPixelToPercentRatio, remainingPixelPercentRatio)) + data.paddedLength
  );
};

export const elementToNode = (
  type: IntrinsicElement,
  { dimension, style, children, props }: RawElement
): ElementNode => {
  const padding = spacingToCompleteSpacing(dimension.padding);
  const margin = spacingToCompleteSpacing(dimension.margin);

  const node: ElementNode = {
    x: {
      size: dimension.width,
      minSize: -1,
      padding1: padding.left,
      padding2: padding.right,
      margin1: margin.left,
      margin2: margin.right,
      direction: style.direction,
    },
    y: {
      size: dimension.height,
      minSize: -1,
      padding1: padding.top,
      padding2: padding.bottom,
      margin1: margin.top,
      margin2: margin.bottom,
      direction: style.direction === "row" ? "column" : "row",
    },
    style,
    type,
    props,
    children: children as ElementNode[],
  };

  if (!node.children?.length) {
    node.x.minSize = typeof node.x.size === "number" ? node.x.size : 0;
    node.y.minSize = typeof node.y.size === "number" ? node.y.size : 0;

    return node;
  }

  const side = node.x.direction === "row" ? "x" : "y";
  const other = side === "x" ? "y" : "x";

  let sideData: SideData = {
    percentSpaceLeft: 1,
    paddedLength: 0,
    staticLength: 0,
    highestPixelToPercentRatio: 0,
  };

  let nodeOtherLength = 0;

  node.children.forEach((child) => {
    sideData = gatherSideData(child, side, sideData);

    if (typeof child[other].size === "string" && child[other].size !== "remaining") {
      const percent = toDecimal(child[other].size as Percent | Fraction);

      const otherSize =
        child[other].minSize / percent + getTotalSize(child[other], { size: false });

      if (otherSize > nodeOtherLength) nodeOtherLength = otherSize;
    } else {
      const childOtherLength = getTotalSize(child[other]);
      if (childOtherLength > nodeOtherLength) nodeOtherLength = childOtherLength;
    }
  });

  node[other].minSize = nodeOtherLength;
  node[side].minSize = processSideData(sideData);

  return normalizeNode(node, side, other);
};
