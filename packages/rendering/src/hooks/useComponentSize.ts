/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ElementNode, getTotalSize } from '../jsx';

interface UseComponentSizeOptions {
  includeMargin?: boolean;
  includePadding?: boolean;
  includeSize?: boolean;
}

const useComponentSize = (
  node: ElementNode,
  side: 'x' | 'y',
  { includeMargin = true, includePadding = true, includeSize = true }: UseComponentSizeOptions = {}
): number =>
  getTotalSize(node[side], {
    margin: includeMargin,
    padding: includePadding,
    size: includeSize,
  });

export const useComponentWidth = (node: ElementNode, opts?: UseComponentSizeOptions) =>
  useComponentSize(node, 'x', opts);

export const useComponentHeight = (node: ElementNode, opts?: UseComponentSizeOptions) =>
  useComponentSize(node, 'y', opts);
