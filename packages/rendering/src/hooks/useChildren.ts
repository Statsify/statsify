/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import type { ElementNode } from "#jsx";

type Child<T> = [T] extends [ElementNode | ElementNode[]]
  ? ElementNode[]
  : T extends any[]
  ? T
  : [T];

export const useChildren = <T>(children: T): Child<T> => children as any;
