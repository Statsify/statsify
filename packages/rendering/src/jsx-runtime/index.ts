/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ElementNode, FC, IntrinsicElement, PropsWithChildren } from '../jsx';
import { intrinsicElements } from '../jsx/instrinsics';
import { elementToNode } from './convert';

export const Fragment: FC = ({ children }) => children as unknown as null;

type Props = PropsWithChildren<unknown>;

export const jsx = (type: IntrinsicElement | FC, props: Props): ElementNode | null => {
  if (props.children) {
    if (Array.isArray(props.children)) {
      props.children = props.children.flat().filter((child) => child);
    } else {
      props.children = [props.children];
    }
  }

  if (typeof type === 'string' && type in intrinsicElements) {
    return elementToNode(type, intrinsicElements[type](props as any));
  } else if (typeof type === 'function') {
    return type(props);
  }

  throw new Error(`Unknown JSX element, with type ${type}`);
};

export const jsxs = jsx;
