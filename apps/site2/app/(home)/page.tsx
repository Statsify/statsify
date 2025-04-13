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
import { SessionSection } from "./sections/session-section";
import { getGuild, getLeaderboard, getPlayer } from "~/app/api";
import Image from "next/image";
import Commands from "~/public/icons/commands.png";
import Servers from "~/public/icons/servers.png";
import { Box } from "~/components/ui/box";
import { Divider } from "~/components/ui/divider";

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
        background="main"
        className="h-[80dvh]"
        mask="linear-gradient(rgb(255 255 255) 20%, rgb(0 0 0 / 0) 95%)"
      />
      {/* TODO: lazy fix, later change how this padding works because of navbar */}
      <div className="h-12 lg:h-8" />

      <div
        className="absolute w-full h-[80dvh] -z-10"
        style={{
          background: "linear-gradient(180deg, rgb(17 17 17 / 0) 80%, rgb(17 17 17 / 1) calc(100% - 50px))",
        }}
      />
      <div className="w-4/5 max-w-[1800px] mx-auto flex flex-col-reverse lg:flex-row text-center gap-4 lg:gap-12 lg:text-start lg:justify-between items-center text-mc-white min-h-[76dvh]">
        <div className="flex flex-col gap-10 lg:gap-6 md:max-w-[500px] xl:max-w-[600px]">
          <div className="flex flex-col gap-3">
            <p className="text-mc-8 xl:text-mc-10 font-bold">
              <span className="text-[#D0EFFF]">S</span>
              <span className="text-[#7DC6FA]">t</span>
              <span className="text-[#2A9DF4]">a</span>
              <span className="text-[#2492E7]">t</span>
              <span className="text-[#1E86DA]">s</span>
              <span className="text-[#187BCD]">i</span>
              <span className="text-[#1571BF]">f</span>
              <span className="text-[#1167B1]">y</span>
            </p>
            <p className="text-mc-3">
              The largest Hypixel Discord bot to view stats from any game on the Hypixel Network.
            </p>
          </div>
          <div className="flex flex-col lg:flex-row items-center flex-wrap gap-4 w-full">
            <div className="grow">
              <DiscordInvite />
            </div>
            <Divider orientation="vertical" className="h-[32px] hidden lg:block opacity-15" />
            <div>
              <BingoInvite />
            </div>
          </div>
        </div>
        <InteractiveLogo />
      </div>
      <div className="flex items-center mt-16 lg:-mt-20 gap-10 lg:gap-0 flex-col lg:flex-row justify-evenly">
        <Box contentClass="flex items-center flex-col gap-1" containerClass="w-[60%] lg:w-[20%]">
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
        <Box contentClass="flex items-center flex-col gap-1" containerClass="w-[60%] lg:w-[20%]">
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
