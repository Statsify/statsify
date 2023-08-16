/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  type ElementNode,
  type FC,
  type IntrinsicElement,
  type PropsWithChildren,
  intrinsicElements,
} from "#jsx";
import { elementToNode } from "./convert.js";

export const Fragment: FC = ({ children }) => children as unknown as null;

type Props = PropsWithChildren<unknown>;

export const jsx = (type: IntrinsicElement | FC, props: Props): ElementNode | null => {
  if (props.children) {
    props.children = Array.isArray(props.children)
      ? props.children.flat().filter(Boolean)
      : [props.children];
  }

  if (typeof type === "string" && type in intrinsicElements) {
    return elementToNode(type, intrinsicElements[type](props as any));
  } else if (typeof type === "function") {
    const el = type(props);

    if (type === Fragment) return el;

    if (el) el.component = type.name;
    return el;
  }

  throw new Error(`Unknown JSX element, with type ${type}`);
};

export const jsxs = jsx;
