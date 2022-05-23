import type { ElementNode } from '../jsx';
import { computeMinSize, getTotalSize, parseMeasurements } from '../jsx/util';

interface UseComponentSizeOptions {
  size?: number;
  includeMargin?: boolean;
  includePadding?: boolean;
  includeSize?: boolean;
}

const useComponentSize = (
  node: ElementNode,
  side: 'x' | 'y',
  {
    size: containerSize,
    includeMargin = true,
    includePadding = true,
    includeSize = true,
  }: UseComponentSizeOptions = {}
): number => {
  let bidirectional = node[side];

  if (!includeSize)
    return getTotalSize(bidirectional, {
      margin: includeMargin,
      padding: includePadding,
      size: false,
    });

  if (containerSize) {
    bidirectional = parseMeasurements(bidirectional, containerSize, false);
  }

  if (typeof bidirectional.size === 'number')
    return getTotalSize(bidirectional, {
      margin: includeMargin,
      padding: includePadding,
      size: true,
    });

  return computeMinSize(node, side, {
    margin: includeMargin,
    padding: includePadding,
    size: true,
  });
};

export const useComponentWidth = (node: ElementNode, opts?: UseComponentSizeOptions) =>
  useComponentSize(node, 'x', opts);

export const useComponentHeight = (node: ElementNode, opts?: UseComponentSizeOptions) =>
  useComponentSize(node, 'y', opts);
