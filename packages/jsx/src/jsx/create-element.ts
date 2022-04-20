import { Box, Div, Image, Text } from '../components';
import { elementToNode } from './convert';
import type { ElementNode, FC } from './types';

const intrinsic = {
  div: Div,
  box: Box,
  img: Image,
  text: Text,
};

export const createElement = (
  type: string | FC,
  props: any,
  ...children: ElementNode[]
): ElementNode => {
  children = children.flat();

  if (typeof type === 'string' && type in intrinsic) {
    return elementToNode(intrinsic[type as keyof typeof intrinsic]({ ...props, children }));
  } else if (typeof type === 'function') {
    return type({ ...props, children });
  }

  throw new Error(`Unknown JSX element, with type ${type}`);
};
