import { elementToNode } from './convert';
import { IntrinsicElement, intrinsicElements } from './instrinsics';
import type { ElementNode, FC } from './types';

export const Fragment: FC = ({ children }) => children as unknown as null;

type Element = ElementNode | string | number | null;

export const createElement = (
  type: IntrinsicElement | FC,
  props: any,
  ...children: Element[]
): ElementNode | null => {
  children = children.flat().filter((child) => child);

  if (typeof type === 'string' && type in intrinsicElements) {
    return elementToNode(type, intrinsicElements[type]({ ...props, children }));
  } else if (typeof type === 'function') {
    return type({ ...props, children });
  }

  throw new Error(`Unknown JSX element, with type ${type}`);
};
