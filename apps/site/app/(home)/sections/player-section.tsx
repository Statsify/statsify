/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

"use client";

import ArcadeIcon from "~/public/icons/slime-ball.png";
import BedWarsIcon from "~/public/icons/bed.png";
import DuelsIcon from "~/public/icons/fishing-rod.png";
import Image from "next/image";
import SkyWarsIcon from "~/public/icons/ender-eye.png";
import { ArcadePreview } from "../previews/arcade";
import { BaseSection } from "./base-section";
import { BedWarsPreview } from "../previews/bedwars";
import { Command } from "~/components/ui/command";
import { Divider } from "~/components/ui/divider";
import { DuelsPreview } from "../previews/duels";
import { PlayerProvider } from "~/app/players/[slug]/context";
import { SkyWarsPreview } from "../previews/skywars";
import { Tab, Tabs } from "~/components/ui/tabs";
import { cn } from "~/lib/util";
import { useState } from "react";
import type { Player } from "@statsify/schemas";

const games = [
  {
    tab: "bedwars",
    formatted: "BedWars",
    component: BedWarsPreview,
    icon: BedWarsIcon,
  },
  {
    tab: "skywars",
    formatted: "SkyWars",
    component: SkyWarsPreview,
    icon: SkyWarsIcon,
  },
  {
    tab: "duels",
    formatted: "Duels",
    component: DuelsPreview,
    icon: DuelsIcon,
  },
  {
    tab: "arcade",
    formatted: "Arcade",
    component: ArcadePreview,
    icon: ArcadeIcon,
  },
] as const;

export function PlayerSection({
  players,
}: {
  players: [Player, Player, Player, Player];
}) {
  const [gameIndex, setGameIndex] = useState<number>(0);

  return (
    <BaseSection
      background={games[gameIndex].tab}
      className="flex-col lg:flex-row justify-between items-center lg:py-0"
    >
      <div className="mx-4 lg:mx-0 flex flex-col gap-4 max-w-100 xl:max-w-120 text-mc-white text-center lg:text-start ">
        <h1 className="text-mc-4 lg:text-mc-7 font-bold text-mc-yellow">
          Players
        </h1>
        <p className="text-mc-1.75 lg:text-mc-2 leading-6">
          Beautiful profiles and visuals are provided by Statsify for all of
          Hypixel games. Enter the game name in the Discord command to view your
          stats. For example, run the <Command command="/bedwars" /> command to
          check your BedWars stats! Make sure to verify using{" "}
          <Command command="/verify" /> to make running Statsify's commands
          easier and faster, and explore the rest of the provided features.
        </p>
      </div>
      <div className="relative w-full lg:w-fit h-full flex flex-col justify-center items-center p-4 lg:p-8 before:absolute before:bg-gradient-to-b before:from-white/20 before:to-white/50 before:mix-blend-overlay before:w-full before:h-full before:-z-20 after:mix-blend-overlay after:w-full after:h-full after:content-[''] after:absolute after:shadow-[0_0_10px_white,0_0_30px_10px_white] after:shadow-white after:-z-20">
        <div className="w-fit flex flex-col gap-4">
          <Tabs
            tab={gameIndex}
            onTabChange={setGameIndex}
            className="grid grid-cols-2 xl:grid-cols-4 grid-flow-row gap-4 text-center xl:w-full"
          >
            {games.map(({ tab, formatted, icon }, index) => (
              <Tab key={tab} tab={index}>
                <Image
                  src={icon}
                  width={32}
                  height={32}
                  alt="icon"
                  style={{ imageRendering: "pixelated" }}
                  className="w-6 h-6 lg:w-8 lg:h-8 opacity-80 group-aria-pressed:opacity-100 transition-opacity"
                />
                {formatted}
              </Tab>
            ))}
          </Tabs>
          <Divider variant="black" />
          <div className="grid grid-areas-stack">
            {games.map(({ tab, component: GamePreview }, index) => (
              <PlayerProvider key={tab} player={players[index]}>
                <GamePreview
                  className={cn(
                    "grid-area-stack invisible",
                    index === gameIndex && "visible"
                  )}
                />
              </PlayerProvider>
            ))}
          </div>
        </div>
      </div>
    </BaseSection>
  );
}
