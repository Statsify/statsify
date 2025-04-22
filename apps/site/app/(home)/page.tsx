/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import Commands from "~/public/icons/book.png";
import Image from "next/image";
import Link from "next/link";
import Servers from "~/public/icons/iron-door.png";
import {
  ARCADE_PREVIEW,
  BEDWARS_PREVIEW,
  DUELS_PREVIEW,
  GUILD_MEMBER_PREVIEW,
  LEADERBOARD_PREVIEW,
  SESSION_PREVIEW,
  SKYWARS_PREVIEW,
} from "./preview-constants";
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
import { getGuild, getLeaderboard, getPlayer } from "~/app/api";

export default async function Home() {
  const [player1, player2, player3, player4, player5, guild, leaderboard] = await Promise.all([
    getPlayer(BEDWARS_PREVIEW),
    getPlayer(SKYWARS_PREVIEW),
    getPlayer(DUELS_PREVIEW),
    getPlayer(ARCADE_PREVIEW),
    getPlayer(SESSION_PREVIEW),
    getGuild(GUILD_MEMBER_PREVIEW),
    getLeaderboard(LEADERBOARD_PREVIEW),
  ]);

  return (
    <div className="relative">
      <Background
        background="general"
        className="h-[80dvh]"
        mask="linear-gradient(rgb(255 255 255) 20%, rgb(0 0 0 / 0) 95%)"
      />
      <div
        className="absolute w-full h-[80dvh] -z-10"
        style={{
          background: "linear-gradient(180deg, rgb(17 17 17 / 0) 80%, rgb(17 17 17 / 1) calc(100% - 50px))",
        }}
      />
      <div className="w-container flex flex-col-reverse lg:flex-row text-center gap-4 lg:gap-12 lg:text-start lg:justify-between items-center text-mc-white min-h-[76dvh]">
        <div className="flex flex-col gap-10 lg:gap-6 md:max-w-[500px] xl:max-w-[600px]">
          <div className="flex flex-col gap-3">
            <Wordmark className="text-mc-6 xl:text-mc-10" />
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
      <div className="w-container flex items-center mt-16 lg:-mt-20 gap-10 lg:gap-0 flex-col lg:flex-row justify-evenly">
        <Box className="content:flex content:items-center content:flex-col content:gap-1 w-[60%] lg:w-[20%]">
          <Image
            src={Servers}
            alt="servers"
            height={64}
            width={64}
            quality={100}
            className="mb-3"
            style={{ imageRendering: "pixelated" }}
          />
          <p className="text-center text-mc-3 text-mc-white font-bold">100,000</p>
          <p className="text-center text-mc-2 text-mc-white">Servers</p>
        </Box>
        <Box className="content:flex content:items-center content:flex-col content:gap-1 w-[60%] lg:w-[20%]">
          <Image
            src={Commands}
            alt="commands"
            height={64}
            width={64}
            quality={100}
            style={{ imageRendering: "pixelated" }}
            className="mb-3"
          />
          <p className="text-center text-mc-3 text-mc-white font-bold">50,000,000</p>
          <p className="text-center text-mc-2 text-mc-white">Commands Ran</p>
        </Box>
      </div>
      <div>
        <PlayerSection players={[player1!, player2!, player3!, player4!]} />
        <LeaderboardSection leaderboard={leaderboard} />
        <SessionSection player={player5!} />
        <GuildSection guild={guild} />
      </div>
      <div className="bg-white/10 backdrop-blur-lg text-mc-white -mt-45 p-8 flex flex-col gap-6 w-container w-auto lg:w-[50%] lg:text-center">
        <div className="flex flex-col gap-2">
          <p className="text-mc-4 font-bold">What are you waiting for?</p>
          <p className="text-mc-2">Invite Statsify today to enhance your Hypixel experience!</p>
        </div>
        <DiscordInvite className="" />
      </div>
    </div>
  );
}

function DiscordInvite({ className = "" }: { className?: string }) {
  return (
    <Button className={`content:bg-discord-500 ${className}`} asChild>
      <Link href="/invite">
        <Discord className="drop-shadow-mc-1" />
        <p className="text-nowrap">Try On Discord</p>
      </Link>
    </Button>
  );
}

function BingoInvite() {
  return (
    <Button className="content:bg-green-500" asChild>
      <Link href="/players">
        <Board className="drop-shadow-mc-1" />
        <p className="text-nowrap">Bingo Tracker</p>
      </Link>
    </Button>
  );
}
