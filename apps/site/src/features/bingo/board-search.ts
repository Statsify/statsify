/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { z } from "zod";

export const CategorySchema = z.enum(["casual", "pvp", "classic"]);
export const DifficultySchema = z.enum(["easy", "hard"]);

// The category names and icons for the overview and its skeleton. They live here rather than in `bingo.tsx` so the
// skeleton, which ships in the route's eager chunk, doesn't pull in the board data.
export const FormattedCategories: Record<z.infer<typeof CategorySchema>, string> = {
  casual: "Casual",
  classic: "Classic",
  pvp: "PvP",
};

export const CATEGORY_ICONS: Record<z.infer<typeof CategorySchema>, string> = {
  casual: "/icons/slime-ball.png",
  pvp: "/icons/ender-eye.png",
  classic: "/icons/snowball.png",
};

// eslint-disable-next-line unicorn/prefer-top-level-await -- zod's fallback value, not a promise
const knownOrUndefined = <T extends z.ZodType>(schema: T) => schema.optional().catch(undefined);

/**
 * `?category=&difficulty=` on the board page. The router parses `?difficulty=1` to a number, so anything
 * that isn't a known value falls back to the defaults instead of failing validation. Its own module, so the
 * route's eager chunk doesn't pull in the board data.
 */
export const BoardSearchSchema = z.object({
  category: knownOrUndefined(CategorySchema),
  difficulty: knownOrUndefined(DifficultySchema),
});
