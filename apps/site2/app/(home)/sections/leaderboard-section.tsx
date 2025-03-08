/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

"use client";

import { Background } from "~/components/ui/background";
import { Command } from "~/components/ui/command";
import { LeaderboardPreview } from "../previews/leaderboard";
import type { PostLeaderboardResponse } from "@statsify/api-client";
import { BaseSection } from "./base-section";

export function LeaderboardSection({ leaderboard }: { leaderboard: PostLeaderboardResponse }) {
  return (
    <BaseSection background="uhc">
        <div className="w-full max-w-[1800px] flex flex-col-reverse lg:flex-row justify-around lg:items-center gap-8 pt-8 lg:pt-0">
				<div
            className="relative w-full lg:w-fit h-full flex flex-col justify-center items-center gap-8 p-4 lg:p-8 before:absolute before:bg-gradient-to-b before:from-white/20 before:to-white/50 before:mix-blend-overlay before:w-full before:h-full before:-z-20 after:mix-blend-overlay after:w-full after:h-full after:content-[''] after:absolute after:shadow-[0_0_10px_white,0_0_30px_10px_white] after:shadow-white after:-z-20"
          >
            <LeaderboardPreview leaderboard={leaderboard} />
          </div>
					
					<div className="mx-auto lg:mx-0 flex flex-col gap-4 max-w-100 xl:max-w-150 text-mc-white text-center lg:text-start ">
            <h1 className="text-mc-4 lg:text-mc-7 font-bold text-mc-yellow">Leaderboards</h1>
            <p className="text-mc-2 leading-6">Using Statsify's robust leaderboard command, you can browse approximately 2,000 leaderboards. The leaderboards may be seen using <Command>/leaderboard</Command> followed by the game and the stat. For instance, to display the leaderboard for WoolWars Wins, for instance, write <Command>/leaderboard woolwars leaderboard: overall wins</Command>.</p>
          </div>
        </div>
			</BaseSection>
  );
}

