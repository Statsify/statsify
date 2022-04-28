import { intrinsicRenders, IntrinsicRenders } from './instrinsics';
import type { BaseThemeContext, ElementNode, Instruction } from './types';
import { computeMinSize, innerSize, parsePercentSize } from './util';

export const _createInstructions = <C extends BaseThemeContext>(
  node: ElementNode,
  width: number,
  height: number,
  intrinsicElements: IntrinsicRenders<C>
): Instruction => {
  node.x = parsePercentSize(node.x, width);
  node.y = parsePercentSize(node.y, height);

  //@ts-ignore IGNORE FOR NOW
  (node as Instruction).render = intrinsicElements[node.type];

  if (node.children?.length) {
    node.children = node.children.map((child) =>
      _createInstructions(
        child,
        innerSize(node.x, width),
        innerSize(node.y, height),
        intrinsicElements
      )
    );

    node.x.size = computeMinSize(node, 'x', node.children as Instruction[]);
    node.y.size = computeMinSize(node, 'y', node.children as Instruction[]);
  }

  return node as Instruction;
};

export const createInstructions = <C extends BaseThemeContext>(
  node: ElementNode,
  width: number,
  height: number,
  intrinsicElements?: Partial<IntrinsicRenders<C>>
) =>
  _createInstructions(node, width, height, {
    ...intrinsicRenders,
    ...intrinsicElements,
  });
