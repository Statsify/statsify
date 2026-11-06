/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Background } from "~/components/ui/background";
import { SkeletonBox } from "~/components/ui/skeleton-box";

const ROW_PLACEHOLDERS = [...Array.from({ length: 6 }).keys()];

/** Shown while a leaderboard page loads on a client-side navigation. */
export function LeaderboardSkeleton() {
  return (
    <div className="relative grow">
      <Background
        background="general"
        className="h-full"
        mask="linear-gradient(rgb(255 255 255) 30%, rgb(0 0 0 / 0) 95%)"
      />
      <div className="absolute h-full w-full bg-[rgb(17_17_17_/0.7)] -z-10" />
      <div className="w-container flex flex-col gap-4 px-4 py-6 text-mc-white md:px-8">
        <div className="h-12" />
        <div className="h-10" />
        <SkeletonBox>
          <ul className="flex flex-col gap-2">
            {ROW_PLACEHOLDERS.map((index) => (
              <li key={index} className="h-12" />
            ))}
          </ul>
        </SkeletonBox>
      </div>
    </div>
  );
}
