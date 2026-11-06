/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import type { Category, Difficulty } from "./boards";

const CATEGORIES: readonly Category[] = ["casual", "pvp", "classic"];
const DIFFICULTIES: readonly Difficulty[] = ["easy", "hard"];

const known = <T extends string>(values: readonly T[], raw: unknown): T | undefined => values.find((value) => value === raw);

/**
 * `?category=&difficulty=` on the board page. The router parses `?difficulty=1` to a number, so anything
 * that isn't a known value falls back to the defaults instead of failing validation. Its own module, so the
 * route's eager chunk doesn't pull in the board data, and a plain function, not a zod schema: every page's first
 * load carries the routes' search parsing.
 */
export const validateBoardSearch = (search: Record<string, unknown>): { category?: Category; difficulty?: Difficulty } => ({
  category: known(CATEGORIES, search.category),
  difficulty: known(DIFFICULTIES, search.difficulty),
});
