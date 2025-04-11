/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

"use client";

import { BaseSection } from "./base-section";
import { Command } from "~/components/ui/command";
import { LeaderboardPreview } from "../previews/leaderboard";
import type { PostLeaderboardResponse } from "@statsify/api-client";

export function LeaderboardSection({ leaderboard }: { leaderboard: PostLeaderboardResponse }) {
  return (
    <BaseSection background="uhc" className="flex-col-reverse lg:flex-row justify-around lg:items-center lg:py-0">
      <div
        className="relative w-full lg:w-fit h-full flex flex-col justify-center items-center gap-8 p-4 lg:p-8 before:absolute before:bg-gradient-to-b before:from-white/20 before:to-white/50 before:mix-blend-overlay before:w-full before:h-full before:-z-20 after:mix-blend-overlay after:w-full after:h-full after:content-[''] after:absolute after:shadow-[0_0_10px_white,0_0_30px_10px_white] after:shadow-white after:-z-20"
      >
        <LeaderboardPreview leaderboard={leaderboard} />
      </div>
      <div className="mx-auto lg:mx-0 flex flex-col gap-4 max-w-100 xl:max-w-150 text-mc-white text-center lg:text-start ">
        <h1 className="text-mc-4 lg:text-mc-7 break-words font-bold text-mc-yellow">Leader<wbr />boards</h1>
        <p className="text-mc-2 leading-6">Explore more than 2,000 Hypixel games leaderboards with Statsify! Leaderboards can be viewed by using the <Command>/leaderboard</Command> command followed by the desired game and stat. Try <Command>/leaderboard uhc leaderboard: score</Command> for an example.</p>
      </div>
    </BaseSection>
  );
}

