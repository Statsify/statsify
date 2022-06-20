/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { useChildren } from '@statsify/rendering';
import { noop } from '@statsify/util';

export interface IfProps<T> {
  condition: T | undefined | null | false;
  children: JSX.Element | JSX.Children<(data: T) => JSX.Children>;
}

export function If<T>({ children: _children, condition }: IfProps<T>): JSX.Element | null {
  const children = useChildren(_children);

  if (condition) {
    return <>{typeof children[0] === 'function' ? children[0](condition) : children}</>;
  }

  return noop();
}
