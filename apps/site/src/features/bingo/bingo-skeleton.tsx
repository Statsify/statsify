/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { CATEGORY_ICONS, FormattedCategories } from "./board-search";
import { Divider } from "~/components/ui/divider";
import { SkeletonBox } from "~/components/ui/skeleton-box";
import { SkeletonTab, Tabs } from "~/components/ui/tabs";
import type { Category } from "./boards";

/** The 6×6 board: rewards along the top row and the right column, tasks in the 4×4 between. */
const CELLS = [...Array.from({ length: 36 }).keys()].map((index) => {
  const [row, column] = [Math.floor(index / 6), index % 6];
  return { index, filled: row === 0 || column === 5 || (row <= 4 && column >= 1) };
});

/**
 * Shown while a board page loads on a client-side navigation. It ships with the route (a split-out pending component
 * would have to download before it could show), so it draws plain boxes at the board\x27s sizes rather than the board
 * text, which would pull the six boards into the entry chunk.
 */
export function BingoSkeleton() {
  return (
    <>
      <div className="w-[80%] flex items-stretch flex-col gap-4">
        <SkeletonBox>
          <div className="w-8 h-8" />
        </SkeletonBox>
        <SkeletonBox className="content:grid content:grid-cols-1 content:lg:grid-cols-3 content:gap-4 content:lg:gap-8">
          <SkeletonCategoryOverview category="casual" />
          <SkeletonCategoryOverview category="pvp" />
          <SkeletonCategoryOverview category="classic" />
        </SkeletonBox>
        <Divider variant="black" />
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2px_2fr] items-center gap-4 **:text-mc-1.5 **:lg:text-mc-2">
          <Tabs defaultTab="casual">
            <SkeletonTab tab="casual">Casual</SkeletonTab>
            <SkeletonTab tab="pvp">PvP</SkeletonTab>
            <SkeletonTab tab="classic">Classic</SkeletonTab>
          </Tabs>
          <Divider orientation="vertical" className="h-[32px] hidden lg:block opacity-15" />
          <Tabs defaultTab="easy">
            <SkeletonTab tab="easy" className="text-mc-green/50 aria-pressed:text-mc-green">
              Easy
            </SkeletonTab>
            <SkeletonTab tab="hard" className="text-mc-red/50 aria-pressed:text-mc-red">
              Hard
            </SkeletonTab>
          </Tabs>
        </div>
      </div>
      <div className="flex flex-col justify-evenly w-full">
        <div className="overflow-x-auto grid grid-cols-[repeat(6,1fr)] grid-rows-6 gap-2">
          {CELLS.map(({ index, filled }) =>
            filled ?
              (
                <SkeletonBox key={index} className="min-w-50">
                  <div className="h-36" />
                </SkeletonBox>
              ) :
              <div key={index} />
          )}
        </div>
      </div>
    </>
  );
}

function SkeletonCategoryOverview({ category }: { category: Category }) {
  return (
    <div className="flex flex-col justify-center gap-1 lg:gap-3 text-center text-mc-1.5 lg:text-mc-2">
      <div className="flex gap-2 items-center justify-center">
        <img
          src={CATEGORY_ICONS[category]}
          width={32}
          height={32}
          alt=""
          style={{ imageRendering: "pixelated" }}
          className="w-6 h-6 lg:w-8 lg:h-8"
        />
        <p className="font-bold text-mc-yellow">{FormattedCategories[category]} Bingo Cards</p>
      </div>
      <div className="flex flex-col justify-center gap-1">
        <p className="text-mc-gray">
          <span className="text-mc-green">Easy</span>:{" "}
          <span>0</span>
          <span className="text-mc-gray">/16</span> completed
        </p>
        <p className="text-mc-gray">
          <span className="text-mc-red">Hard</span>:{" "}
          <span>0</span>
          <span className="text-mc-gray">/16</span> completed
        </p>
      </div>
    </div>
  );
}
