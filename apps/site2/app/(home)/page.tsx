/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Background } from "~/components/ui/background";
import { Board } from "~/components/icons/board";
import { Button } from "~/components/ui/button";
import { Discord } from "~/components/icons/discord";
import { GuildSection } from "./sections/guild-section";
import { InteractiveLogo } from "./interactive-logo";
import { LeaderboardSection } from "./sections/leaderboard-section";
import { PlayerSection } from "./sections/player-section";
import { SearchIcon } from "~/components/icons/search";
import { SessionSection } from "./sections/session-section";
import { cn } from "~/lib/util";
import { getGuild, getLeaderboard, getPlayer } from "~/app/api";

export default async function Home() {
  const [player1, player2, player3, player4, player5, guild, leaderboard] = await Promise.all([
    getPlayer("618a96fec8b0493fa89427891049550b"),
    getPlayer("96f645ba026b4e45bc34dd8f0531334c"),
    getPlayer("20aa2cf67b7443a093b5f3666c160f5f"),
    getPlayer("92a5199614ac4bd181d1f3c951fb719f"),
    getPlayer("855c4abb7d2e42a1a8bfa236afed83f3"),
    getGuild("96f645ba026b4e45bc34dd8f0531334c"),
    getLeaderboard("stats.uhc.score"),
  ]);

  return (
    <div className="relative">
      <Background
        background="background"
        className="h-[80dvh]"
        mask="linear-gradient(rgb(255 255 255) 20%, rgb(0 0 0 / 0) 95%)"
      />
      <div
        className="absolute w-full h-[80dvh] bg-red-200 -z-10"
        style={{
          background: "linear-gradient(180deg, rgb(17 17 17 / 0) 80%, rgb(17 17 17 / 1) calc(100% - 50px))",
        }}
      />
      <div className="w-4/5 max-w-[1800px] mx-auto flex flex-col-reverse lg:flex-row text-center gap-4 lg:gap-12 lg:text-start lg:justify-between items-center text-mc-white min-h-[76dvh]">
        <div className="flex flex-col gap-10 lg:gap-6 md:max-w-[500px] xl:max-w-[600px]">
          <div className="flex flex-col gap-3">
            <p className="text-mc-8 xl:text-mc-10 font-bold"><span className="text-[#D0EFFF]">S</span><span className="text-[#7DC6FA]">t</span><span className="text-[#2A9DF4]">a</span><span className="text-[#2492E7]">t</span><span className="text-[#1E86DA]">s</span><span className="text-[#187BCD]">i</span><span className="text-[#1571BF]">f</span><span className="text-[#1167B1]">y</span></p>
            <p className="text-mc-3">The largest Hypixel Discord bot to view stats from any game on the Hypixel Network.</p>
          </div>
          <div className="flex flex-col lg:flex-row items-center flex-wrap gap-4 w-full">
            <div className="grow">
              <DiscordInvite />
            </div>
            <div className="h-[32px] w-[2px] bg-white/20 hidden lg:block" />
            <div>
              <BingoInvite />
            </div>
          </div>
        </div>
        <InteractiveLogo />
      </div>
      <div>
        <PlayerSection players={[player1, player2, player3, player4]} />
        <LeaderboardSection leaderboard={leaderboard} />
        <SessionSection player={player5} />
        <GuildSection guild={guild} />
      </div>
      <div className="bg-white/10 backdrop-blur-lg text-mc-white -mt-45 p-8 flex flex-col gap-6 max-w-4/5 mx-auto">
        <div className="flex flex-col gap-2">
          <p className="text-mc-4 font-bold">What are you waiting for?</p>
          <p className="text-mc-2">Invite Statsify today to enhance your Hypixel experience!</p>
        </div>
        <Button className="bg-discord-500">
          <Discord className="drop-shadow-mc-1" />
          <p className="text-nowrap">Try On Discord</p>
        </Button>
      </div>
    </div>
  );
}

function Search({ className }: { className?: string }) {
  return (
    <div className={cn("h-16 flex items-center px-4 gap-4 bg-white/30 border-4 border-white/40 backdrop-blur-sm", className)}>
      <SearchIcon className="size-8 text-white drop-shadow-mc-2" />
      <input placeholder="Search your stats" className="text-mc-2 placeholder-mc-darkgray text-white outline-none h-full w-full selection:bg-white/50" spellCheck={false} />
    </div>
  );
}

function DiscordInvite() {
  return (
    <Button className="bg-discord-500">
      <Discord className="drop-shadow-mc-1" />
      <p className="text-nowrap">Try On Discord</p>
    </Button>
  );
}

function BingoInvite() {
  return (
    <Button className="bg-green-500">
      <Board className="drop-shadow-mc-1" />
      <p className="text-nowrap">Bingo Tracker</p>
    </Button>
  );
}

