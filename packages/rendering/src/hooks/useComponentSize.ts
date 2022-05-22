import type { ElementNode, InstructionBiDirectional } from '../jsx';
import { getTotalSize, parseMeasurements } from '../jsx/util';

const useComponentSize = (node: ElementNode, side: 'x' | 'y', containerSize?: number): number => {
  let bidirectional = node[side];

  if (containerSize) {
    bidirectional = parseMeasurements(node[side], containerSize, false);
  }

  if (typeof bidirectional.size === 'number')
    return getTotalSize(bidirectional as InstructionBiDirectional);

  let minSize = 0;

  switch (bidirectional.direction) {
    case 'row':
      minSize = (node.children ?? []).reduce(
        (acc, child) => acc + useComponentSize(child, side, containerSize),
        0
      );
      break;
    case 'column':
      minSize = node.children?.length
        ? Math.max(...node.children.map((child) => useComponentSize(child, side, containerSize)))
        : 0;
      break;
  }

  return getTotalSize({
    ...bidirectional,
    size: minSize,
  });
};

export const useComponentWidth = (node: ElementNode, width?: number) =>
  useComponentSize(node, 'x', width);

export const useComponentHeight = (node: ElementNode, height?: number) =>
  useComponentSize(node, 'y', height);
