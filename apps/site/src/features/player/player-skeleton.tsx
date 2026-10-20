/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Background } from "~/components/ui/background";
import { SkeletonBox } from "~/components/ui/skeleton-box";

const GAME_PLACEHOLDERS = [...Array.from({ length: 8 }).keys()];

/** Shown while a player page loads on a client-side navigation; mirrors the page's grid. */
export function PlayerSkeleton({ name }: { name: string }) {
  return (
    <div className="relative grow">
      <Background
        background="general"
        className="h-full"
        mask="linear-gradient(rgb(255 255 255) 30%, rgb(0 0 0 / 0) 95%)"
      />
      <div className="absolute h-full w-full bg-[rgb(17_17_17_/0.7)] -z-10" />
      <div className="w-container flex flex-col gap-4 px-4 py-6 text-mc-white md:px-8">
        <div className="grid grid-cols-1 gap-2 lg:grid-cols-[3fr_2fr]">
          <SkeletonBox className="lg:row-span-2">
            <p className="text-mc-1.5 sm:text-mc-2">{name}</p>
            <div className="h-40" />
          </SkeletonBox>
          <SkeletonBox>
            <div className="h-20" />
          </SkeletonBox>
          <SkeletonBox>
            <div className="h-20" />
          </SkeletonBox>
        </div>
        <div className="h-12" />
        <ul className="grid grid-cols-1 gap-2 min-[480px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {GAME_PLACEHOLDERS.map((index) => (
            <li key={index}>
              <SkeletonBox>
                <div className="h-32" />
              </SkeletonBox>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
