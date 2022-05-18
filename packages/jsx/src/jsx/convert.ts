import type { IntrinsicElement } from './instrinsics';
import type { CompleteSpacing, ElementNode, Measurement, RawElement, Spacing } from './types';

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
  { dimension, style, children, props }: RawElement
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

export const convertMeasurementToValue = (measurement: Measurement): number => {
  if (typeof measurement === 'number') return measurement;
  if (measurement.endsWith('%')) return parseFloat(measurement.replace('%', '')) / 100;

  const [num, denom] = measurement.split('/').map((v) => parseInt(v, 10));
  return num / denom;
};
