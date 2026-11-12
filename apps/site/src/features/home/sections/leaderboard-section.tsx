/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { BaseSection } from "./base-section";
import { Command } from "~/components/ui/command";
import { LeaderboardPreview } from "../previews/leaderboard";
import type { LeaderboardPage } from "@statsify/contract";

export function LeaderboardSection({
  leaderboard,
}: {
  leaderboard: LeaderboardPage;
}) {
  return (
    <BaseSection
      background="uhc"
      className="flex-col-reverse lg:flex-row justify-between items-center"
    >
      <div className="relative w-full lg:w-fit h-full flex flex-col justify-center items-center gap-8 p-4 lg:p-8 before:absolute before:bg-gradient-to-b before:from-white/20 before:to-white/50 before:mix-blend-overlay before:w-full before:h-full before:-z-20">
        <LeaderboardPreview leaderboard={leaderboard} />
      </div>
      <div className="flex flex-col gap-4 max-w-100 xl:max-w-150 text-mc-white">
        <h2 className="text-mc-4 lg:text-mc-7 break-words font-bold text-mc-yellow">
          Leader
          <wbr />
          boards
        </h2>
        <p className="text-mc-1.5 lg:text-mc-2 leading-[1.35] max-w-[60ch]">
          Explore more than 2,000 Hypixel game leaderboards with Statsify!
          Leaderboards can be viewed by using the{" "}
          <Command command="/leaderboard" /> command followed by the desired
          game and stat. Try{" "}
          <Command command="/leaderboard uhc leaderboard: score" /> for an
          example.
        </p>
      </div>
    </BaseSection>
  );
}
