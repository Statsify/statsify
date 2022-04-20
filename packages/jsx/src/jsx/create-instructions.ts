import type { ElementNode, Instruction } from './types';
import { computeMinSize, innerSize, parsePercentSize } from './util';

export const createInstructions = (
  node: ElementNode,
  width: number,
  height: number
): Instruction => {
  node.x = parsePercentSize(node.x, width);
  node.y = parsePercentSize(node.y, height);

  if (node.children?.length) {
    node.children = node.children.map((child) =>
      createInstructions(child, innerSize(node.x, width), innerSize(node.y, height))
    );

    node.x.size = computeMinSize(node, 'x', node.children as Instruction[]);
    node.y.size = computeMinSize(node, 'y', node.children as Instruction[]);
  }

  return node as Instruction;
};
