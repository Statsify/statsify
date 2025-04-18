/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

"use client";

import { Box } from "~/components/ui/box";
import { MinecraftText } from "~/components/ui/minecraft-text";
import { Nametag } from "~/components/ui/nametag";
import { Sidebar, SidebarItem } from "~/components/ui/sidebar";
import { Skin } from "~/components/ui/skin";
import { TableData } from "~/components/ui/table";
import { cn } from "~/lib/util";
import { t } from "~/localize";
import { usePlayer } from "~/app/players/[slug]/context";

export function arrayGroup<T extends unknown[] | string>(
  arr: T,
  groupSize: number
): T[] {
  return Array.from(
    { length: Math.ceil(arr.length / groupSize) },
    (_, i) => arr.slice(i * groupSize, (i + 1) * groupSize)
  ) as T[];
}

export function ArcadePreview({ className }: { className?: string }) {
  const player = usePlayer();
  const arcade = player.stats.arcade;

  const games: [string, number][] = [
    ["Blocking Dead", arcade.blockingDead.wins],
    ["Bounty Hunters", arcade.bountyHunters.wins],
    ["Dragon Wars", arcade.dragonWars.wins],
    ["Dropper", arcade.dropper.wins],
    ["Ender Spleef", arcade.enderSpleef.wins],
    ["Farm Hunt", arcade.farmHunt.wins],
    ["Football", arcade.football.wins],
    ["Galaxy Wars", arcade.galaxyWars.wins],
    ["Hide And Seek", arcade.hideAndSeek.overall.wins],
    ["Hole In The Wall", arcade.holeInTheWall.wins],
    ["Hypixel Says", arcade.hypixelSays.wins],
    ["Mini Walls", arcade.miniWalls.wins],
    ["Party Games", arcade.partyGames.wins],
    ["Pixel Painters", arcade.pixelPainters.wins],
    ["Pixel Party", arcade.pixelParty.overall.wins],
    ["Seasonal", arcade.seasonal.totalWins],
    ["Throw Out", arcade.throwOut.wins],
    ["Zombies", arcade.zombies.overall.wins],
  ];

  games.sort((a, b) => b[1] - a[1]);

  const rows = arrayGroup(games, 3);
  const colors = ["text-mc-pink", "text-mc-aqua", "text-mc-green", "text-mc-yellow", "text-mc-gold", "text-mc-red"];

  return (
    <div className={cn("grid grid-cols-3 gap-2 whitespace-nowrap", className)}>
      <div className="col-span-3 grid grid-cols-1 xl:grid-cols-balanced gap-2 text-center">
        <Skin uuid={player.uuid} className="container:xl:row-start-1 container:xl:row-end-4 container:hidden container:xl:block h-full" />
        <Nametag className="container:row-start-1 container:xl:col-start-2" />
        <Box className="container:row-start-3 container:xl:row-start-2 container:xl:row-span-2 container:xl:col-start-2">
          <span className="font-bold"><MinecraftText>§cA§6r§ec§aa§bd§de§f</MinecraftText> Wins</span> (Overall)
        </Box>
        <Sidebar className="container:row-start-2 container:xl:row-start-1 container:xl:row-end-4">
          <SidebarItem color="text-mc-gold" name="Coins" value={t(arcade.coins)} />
          <SidebarItem color="text-mc-yellow" name="Conversions" value={t(arcade.coinConversions)} />
          <SidebarItem color="text-mc-aqua" name="Arcade Wins" value={t(arcade.wins)} />
        </Sidebar>
      </div>
      {rows.slice(0, 2).map((row, index) => row.map(([game, wins]) => (
        <TableData
          key={game}
          title={game}
          value={t(wins)}
          color={colors[index]}
        />
      )))}
    </div>
  );
}

