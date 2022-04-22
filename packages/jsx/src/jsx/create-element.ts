import { elementToNode } from './convert';
import { IntrinsicElement, intrinsicElements } from './instrinsics';
import type { ElementNode, FC } from './types';

export const createElement = (
  type: IntrinsicElement | FC,
  props: any,
  ...children: ElementNode[]
): ElementNode => {
  children = children.flat();

  if (typeof type === 'string' && type in intrinsicElements) {
    return elementToNode(type, intrinsicElements[type]({ ...props, children }));
  } else if (typeof type === 'function') {
    return type({ ...props, children });
  }

  throw new Error(`Unknown JSX element, with type ${type}`);
};
