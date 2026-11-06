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
import { Link } from "@tanstack/react-router";
import { MotionConfig } from "motion/react";
import { Wordmark } from "~/components/icons/logo";
import type { HomeData } from "./home-data";

/** Each section shows only when its preview loaded; the API hands back `null` otherwise. */
export function Home({ players, guild, leaderboard }: HomeData) {
  return (
    // With reduced motion, Motion skips the transform animations (the carousel slide, drags snapping back);
    // `overflow-x-clip`: the draggable stat boxes around the logo may never widen the page.
    <MotionConfig reducedMotion="user">
      <div className="relative overflow-x-clip">
        <div className="relative">
          <Background background="general" priority className="h-full" />
          <div
            className="absolute w-full h-full -z-10"
            style={{
              // Where the gradient ends needs to be added onto the padding bottom of the header so py-30 + pb-6 = pb-36
              background: "linear-gradient(180deg, transparent 80%, var(--color-blackify-950) calc(100% - (var(--spacing) * 6)))",
            }}
          />
          {/* Left-aligned copy at every width, inside the page padding. */}
          <div className="w-container flex flex-col-reverse lg:flex-row gap-4 lg:gap-12 lg:justify-between items-center text-mc-white px-4 md:px-8 py-15 pb-21 lg:py-30 lg:pb-36">
            <div className="flex w-full flex-col gap-10 lg:gap-6 md:max-w-[500px] xl:max-w-[600px]">
              <div className="flex flex-col gap-3">
                <Wordmark as="h1" className="text-mc-4 xl:text-mc-7" />
                <p className="text-mc-1.5 md:text-mc-2">
                  The largest Hypixel Discord bot to view stats from any game on the Hypixel Network.
                </p>
              </div>
              <div className="flex flex-col lg:flex-row lg:items-center flex-wrap gap-4 w-full">
                <DiscordInvite className="grow" />
                <Divider orientation="vertical" className="h-[32px] hidden lg:block opacity-15" />
                <BingoInvite />
              </div>
            </div>
            <InteractiveLogo />
          </div>
        </div>
        <div className="w-container flex items-center lg:-mt-20 gap-10 lg:gap-0 flex-col sm:flex-row justify-evenly px-4 md:px-8">
          <Box className="content:flex content:items-center content:flex-col content:gap-1 w-[60%] sm:w-[40%] lg:w-[20%]">
            <img
              src="/icons/iron-door.png"
              alt=""
              height={64}
              width={64}
              className="mb-3"
              style={{ imageRendering: "pixelated" }}
            />
            <p className="text-center text-mc-3 text-mc-white font-bold">
              <AnimatedNumber value={110_000} />+
            </p>
            <p className="text-center text-mc-2 text-mc-white">Servers</p>
          </Box>
          <Box className="content:flex content:items-center content:flex-col content:gap-1 w-[60%] sm:w-[40%] lg:w-[20%]">
            <img
              src="/icons/book.png"
              alt=""
              height={64}
              width={64}
              style={{ imageRendering: "pixelated" }}
              className="mb-3"
            />
            <p className="text-center text-mc-3 text-mc-white font-bold"><AnimatedNumber value={70_000_000} />+</p>
            <p className="text-center text-mc-2 text-mc-white">Commands Run</p>
          </Box>
        </div>
        <div>
          <PlayerSection players={players} />
          {leaderboard && <LeaderboardSection leaderboard={leaderboard} />}
          {players.session && <SessionSection player={players.session} />}
          {guild && <GuildSection guild={guild} />}
        </div>
        <div className="w-container px-4 md:px-8 pb-16 lg:w-[50%] lg:pb-32">
          <Box className="text-mc-white text-balance text-center content:flex content:flex-col content:gap-6 content:p-8">
            <div className="flex flex-col gap-2">
              <p className="text-mc-3 lg:text-mc-4 font-bold">What are you waiting for?</p>
              <p className="text-mc-1.5 md:text-mc-2">Invite Statsify today to enhance your Hypixel experience!</p>
            </div>
            <DiscordInvite />
          </Box>
        </div>
      </div>
    </MotionConfig>
  );
}

// The home page's one primary action. `/invite` is answered by the server with a
// 301, so it is a plain anchor rather than a router link.
function DiscordInvite({ className = "" }: { className?: string }) {
  return (
    <Button variant="primary" className={`content:bg-discord-500 ${className}`} asChild>
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
      <Link to="/{-$locale}/bingo">
        <Board className="drop-shadow-mc-1" />
        <p className="text-nowrap">Bingo Tracker</p>
      </Link>
    </Button>
  );
}
