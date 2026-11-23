/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import type { GamePage, StatCell as Stat, StatSection } from "@statsify/contract";

export type Pair = { a: Stat; b: Stat };

/**
 * The stats both pages show, paired by key in the first page's order: the game-wide row, then each table. Lists (maps,
 * titles) and selections (a kit) are left out, as two players' lists differ and a selection has no difference.
 */
export function comparePairs(a: GamePage, b: GamePage): { section?: StatSection; pairs: Pair[] }[] {
  const others = new Map([...b.overview, ...b.sections.flatMap((section) => section.rows.flat())].map((cell) => [cell.key, cell]));
  const pair = (cells: Stat[]) =>
    cells.flatMap((cell) => {
      const other = others.get(cell.key);
      return cell.inline || !other ? [] : [{ a: cell, b: other }];
    });

  return [
    { pairs: pair(a.overview) },
    ...a.sections.filter((section) => !section.list).map((section) => ({ section, pairs: pair(section.rows.flat()) })),
  ].filter(({ pairs }) => pairs.length > 0);
}
