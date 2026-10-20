/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { AnimatedNumber } from "~/components/animations/number";
import { Background } from "~/components/ui/background";
import { Board } from "~/components/icons/board";
import { Box } from "~/components/ui/box";
import { Button } from "~/components/ui/button";
import { Discord } from "~/components/icons/discord";
import { Divider } from "~/components/ui/divider";
import { GuildSection } from "./sections/guild-section";
import { InteractiveLogo } from "./interactive-logo";
import { LeaderboardSection } from "./sections/leaderboard-section";
import { PlayerSection } from "./sections/player-section";
import { SessionSection } from "./sections/session-section";
import { Wordmark } from "~/components/icons/logo";
import type { HomeData } from "./home-data";

export function Home({ players, sessionPlayer, guild, leaderboard }: HomeData) {
  return (
    <div className="relative">
      <div className="relative">
        <Background background="general" priority className="h-full" />
        <div
          className="absolute w-full h-full -z-10"
          style={{
            // Where the gradient ends needs to be added onto the padding bottom of the header so py-30 + pb-6 = pb-36
            background: "linear-gradient(180deg, transparent 80%, var(--color-blackify-950) calc(100% - (var(--spacing) * 6)))",
          }}
        />
        <div className="w-container flex flex-col-reverse lg:flex-row text-center gap-4 lg:gap-12 lg:text-start lg:justify-between items-center text-mc-white py-15 pb-21 lg:py-30 lg:pb-36">
          <div className="flex flex-col gap-10 lg:gap-6 md:max-w-[500px] xl:max-w-[600px]">
            <div className="flex flex-col gap-3">
              <Wordmark className="text-mc-4 xl:text-mc-7" />
              <p className="text-mc-2">
                The largest Hypixel Discord bot to view stats from any game on the Hypixel Network.
              </p>
            </div>
            <div className="flex flex-col lg:flex-row items-center flex-wrap gap-4 w-full">
              <DiscordInvite className="grow" />
              <Divider orientation="vertical" className="h-[32px] hidden lg:block opacity-15" />
              <BingoInvite />
            </div>
          </div>
          <InteractiveLogo />
        </div>
      </div>
      <div className="w-container flex items-center lg:-mt-20 gap-10 lg:gap-0 flex-col lg:flex-row justify-evenly">
        <Box className="content:flex content:items-center content:flex-col content:gap-1 w-[60%] lg:w-[20%]">
          <img
            src="/icons/iron-door.png"
            alt="servers"
            height={64}
            width={64}
            className="mb-3"
            style={{ imageRendering: "pixelated" }}
          />
          <p className="text-center text-mc-3 text-mc-white font-bold">
            <AnimatedNumber value={100_000} />
          </p>
          <p className="text-center text-mc-2 text-mc-white">Servers</p>
        </Box>
        <Box className="content:flex content:items-center content:flex-col content:gap-1 w-[60%] lg:w-[20%]">
          <img
            src="/icons/book.png"
            alt="commands"
            height={64}
            width={64}
            style={{ imageRendering: "pixelated" }}
            className="mb-3"
          />
          <p className="text-center text-mc-3 text-mc-white font-bold"><AnimatedNumber value={50_000_000} /></p>
          <p className="text-center text-mc-2 text-mc-white">Commands Ran</p>
        </Box>
      </div>
      <div>
        <PlayerSection players={players} />
        <LeaderboardSection leaderboard={leaderboard} />
        <SessionSection player={sessionPlayer} />
        <GuildSection guild={guild} />
      </div>
      <div className="bg-white/10 backdrop-blur-lg text-mc-white -mt-45 p-8 flex flex-col gap-6 w-container w-auto lg:w-[50%] text-balance text-center">
        <div className="flex flex-col gap-2">
          <p className="text-mc-3 lg:text-mc-4 font-bold">What are you waiting for?</p>
          <p className="text-mc-2">Invite Statsify today to enhance your Hypixel experience!</p>
        </div>
        <DiscordInvite className="" />
      </div>
    </div>
  );
}

// `/invite` is answered by the server with a 301 and `/bingo` isn't a route yet, so both are plain anchors.
function DiscordInvite({ className = "" }: { className?: string }) {
  return (
    <Button className={`content:bg-discord-500 ${className}`} asChild>
      <a href="/invite">
        <Discord className="drop-shadow-mc-1" />
        <p className="text-nowrap">Try On Discord</p>
      </a>
    </Button>
  );
}

function BingoInvite() {
  return (
    <Button className="content:bg-green-500" asChild>
      <a href="/bingo">
        <Board className="drop-shadow-mc-1" />
        <p className="text-nowrap">Bingo Tracker</p>
      </a>
    </Button>
  );
}
