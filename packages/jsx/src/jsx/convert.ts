import type { IntrinsicElement } from './instrinsics';
import type { CompleteSpacing, Element, ElementNode, Percentage, Spacing } from './types';

export const spacingToCompleteSpacing = (spacing?: Spacing): CompleteSpacing => {
  if (typeof spacing === 'number') {
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

export const elementToNode = (
  type: IntrinsicElement,
  { dimension, style, children, props }: Element
): ElementNode => {
  const padding = spacingToCompleteSpacing(dimension.padding);
  const margin = spacingToCompleteSpacing(dimension.margin);

  return {
    x: {
      size: dimension.width,
      padding1: padding.left,
      padding2: padding.right,
      margin1: margin.left,
      margin2: margin.right,
      direction: style.direction,
    },
    y: {
      size: dimension.height,
      padding1: padding.top,
      padding2: padding.bottom,
      margin1: margin.top,
      margin2: margin.bottom,
      direction: style.direction === 'row' ? 'column' : 'row',
    },
    style,
    type,
    props,
    children: children as ElementNode[],
  };
};

export const fromPercentToValue = (percent: Percentage): number =>
  parseInt(percent.replace(/%/g, '')) * 0.01;
