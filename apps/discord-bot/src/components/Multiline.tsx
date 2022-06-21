/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { useChildren } from '@statsify/rendering';

export interface MultilineProps {
  children: JSX.IntrinsicElements['text']['children'];
}

export const Multiline = ({ children }: MultilineProps) => (
  <>
    {useChildren(children)
      .join(' ')
      .split('\n')
      .map((t) => (
        <text margin={1}>{t}</text>
      ))}
  </>
);
