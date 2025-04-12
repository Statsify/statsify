/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

"use client";

import ArcadeIcon from "~/public/icons/arcade.png";
import BedWarsIcon from "~/public/icons/bedwars.png";
import DuelsIcon from "~/public/icons/duels.png";
import Image from "next/image";
import SkyWarsIcon from "~/public/icons/skywars.png";
import { ArcadePreview } from "../previews/arcade";
import { BaseSection } from "./base-section";
import { BedWarsPreview } from "../previews/bedwars";
import { Box } from "~/components/ui/box";
import { Command } from "~/components/ui/command";
import { DuelsPreview } from "../previews/duels";
import { PlayerProvider } from "~/app/players/[slug]/context";
import { SkyWarsPreview } from "../previews/skywars";
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

export function PlayerSection({ players }: { players: [Player, Player, Player, Player] }) {
  const [activeTab, setActiveTab] = useState<number>(0);

  return (
    <BaseSection
      background={games[activeTab].tab}
      className="flex-col lg:flex-row justify-around lg:items-center lg:py-0"
    >
      <div className="mx-auto lg:mx-0 flex flex-col gap-4 max-w-100 xl:max-w-120 text-mc-white text-center lg:text-start ">
        <h1 className="text-mc-4 lg:text-mc-7 font-bold text-mc-yellow">Players</h1>
        <p className="text-mc-2 leading-6">
          Beautiful profiles and visuals are provided by Statsify for all of Hypixel games. Enter the game name in the
          Discord command to view your stats. For example, run the <Command>/bedwars</Command> command to check your
          BedWars stats! Make sure to verify using <Command>/verify</Command> to make running Statsify's commands easier
          and faster, and explore the rest of the provided features.
        </p>
      </div>
      <div className="relative w-full lg:w-fit h-full flex flex-col justify-center items-center p-4 lg:p-8 before:absolute before:bg-gradient-to-b before:from-white/20 before:to-white/50 before:mix-blend-overlay before:w-full before:h-full before:-z-20 after:mix-blend-overlay after:w-full after:h-full after:content-[''] after:absolute after:shadow-[0_0_10px_white,0_0_30px_10px_white] after:shadow-white after:-z-20">
        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} players={players} />
      </div>
    </BaseSection>
  );
}

function Tabs({
  activeTab,
  setActiveTab,
  players,
}: {
  activeTab: number;
  setActiveTab: (activeTab: number) => void;
  players: [Player, Player, Player, Player];
}) {
  return (
    <div className="w-fit flex flex-col gap-4">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 text-center xl:w-full">
        {games.map(({ tab, formatted, icon }, index) => (
          <button
            key={tab}
            aria-pressed={activeTab === index}
            className="group"
            type="button"
            onClick={() => setActiveTab(index)}
          >
            <Box borderRadius={{ bottom: 0 }}>
              <div className="flex items-center justify-center gap-2 text-mc-gray group-aria-pressed:font-bold group-aria-pressed:text-mc-white transition-colors">
                <Image
                  src={icon}
                  width={32}
                  height={32}
                  alt="icon"
                  style={{ imageRendering: "pixelated" }}
                  className="opacity-80 group-aria-pressed:opacity-100 transition-opacity"
                />
                {formatted}
              </div>
            </Box>
          </button>
        ))}
      </div>
      <div className="w-full h-[2px] bg-black/50" />
      <div className="grid grid-areas-stack">
        {games.map(({ tab, component: GamePreview }, index) => (
          <PlayerProvider key={tab} player={players[index]}>
            <GamePreview className={cn("grid-area-stack invisible", activeTab === index && "visible")} />
          </PlayerProvider>
        ))}
      </div>
    </div>
  );
}
