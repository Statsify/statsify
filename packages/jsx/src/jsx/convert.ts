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

export const elementToNode = (element: Element): ElementNode => {
  const padding = spacingToCompleteSpacing(element.dimension.padding);
  const margin = spacingToCompleteSpacing(element.dimension.margin);

  return {
    x: {
      size: element.dimension.width,
      padding1: padding.left,
      padding2: padding.right,
      margin1: margin.left,
      margin2: margin.right,
      direction: element.style.direction,
    },
    y: {
      size: element.dimension.height,
      padding1: padding.top,
      padding2: padding.bottom,
      margin1: margin.top,
      margin2: margin.bottom,
      direction: element.style.direction === 'row' ? 'column' : 'row',
    },
    style: element.style,
    children: element.children as ElementNode[],
    render: element.render,
  };
};

export const fromPercentToValue = (percent: Percentage): number =>
  parseInt(percent.replace(/%/g, '')) * 0.01;
