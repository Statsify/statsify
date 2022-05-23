import { intrinsicRenders, IntrinsicRenders } from './instrinsics';
import type { BaseThemeContext, ElementNode, Instruction } from './types';
import { computeMinSize, getTotalSize, innerSize, parseMeasurements } from './util';

export const _createInstructions = <C extends BaseThemeContext>(
  node: ElementNode,
  width: number,
  height: number,
  intrinsicElements: IntrinsicRenders<C>
): Instruction => {
  node.x = parseMeasurements(node.x, width);
  node.y = parseMeasurements(node.y, height);

  //@ts-ignore Add the render function to the node, and start transformation to instruction
  (node as Instruction).render = intrinsicElements[node.type];

  if (node.children?.length) {
    const inner = {
      x: innerSize(node.x, width),
      y: innerSize(node.y, height),
    };

    type Side = 'x' | 'y';
    let side: Side;
    let otherSide: Side;

    if (node.style.direction === 'row') {
      side = 'x';
      otherSide = 'y';
    } else {
      side = 'y';
      otherSide = 'x';
    }

    let remaining = inner[side];

    const childrenWithRemainingSizes = [];

    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i];

      if (child[otherSide].size === 'remaining') {
        //Subtract the margin and padding from the constant size for the size of the child
        child[otherSide].size =
          inner[otherSide] -
          getTotalSize(child[otherSide], { margin: true, padding: true, size: false });
      }

      if (child[side].size === 'remaining') {
        //Subtract the margin and padding from the remaining size
        remaining -= getTotalSize(child[side], { margin: true, padding: true, size: false });
        childrenWithRemainingSizes.push(i);
        //It won't be possible to compute the size of the child if it's remaining, so skip for now
        continue;
      }

      const childInstruction = _createInstructions(child, inner.x, inner.y, intrinsicElements);

      node.children[i] = childInstruction;

      //Remove the child's size, margin, and padding from the remaining size
      remaining -= getTotalSize(childInstruction[side]);
    }

    if (childrenWithRemainingSizes.length) {
      //Split the remaining space equally between all the remaining children
      const splitRemainingSize = remaining / childrenWithRemainingSizes.length;

      for (const i of childrenWithRemainingSizes) {
        const child = node.children[i];
        child[side].size = splitRemainingSize;
        const childInstruction = _createInstructions(child, inner.x, inner.y, intrinsicElements);
        node.children[i] = childInstruction;
      }
    }

    node.x.size = computeMinSize(node, 'x', { margin: false, padding: false });
    node.y.size = computeMinSize(node, 'y', { margin: false, padding: false });
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
