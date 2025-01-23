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
import { Skin } from "~/components/ui/skin";
import { TableData } from "~/components/ui/table";
import { cn } from "~/lib/util";
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
      <div className="col-span-3 grid grid-cols-1 xl:grid-cols-[minmax(min-content,max-content)_1fr_minmax(min-content,max-content)] gap-2 text-center">
        <Skin uuid={player.uuid} containerClass="xl:row-start-1 xl:row-end-4 hidden xl:block" contentClass="h-full" />
        <Box containerClass="row-start-1 xl:col-start-2">
          <MinecraftText className="text-mc-4">{player.prefixName}</MinecraftText>
        </Box>
        <Box containerClass="row-start-4 xl:row-start-3 xl:col-start-2">
          <span className="font-bold"><MinecraftText>§cA§6r§ec§aa§bd§de§f</MinecraftText> Wins</span> (Overall)
        </Box>
        <Box containerClass="row-start-3 xl:row-start-1 xl:row-end-4" contentClass="grid grid-cols-2 xl:flex xl:flex-col justify-center gap-2 text-start">
          <p><span className="text-mc-gold">●</span> Coins: <span className="text-mc-gold">{arcade.coins}</span></p>
          <p><span className="text-mc-yellow">●</span> Conversions: <span className="text-mc-yellow">{arcade.coinConversions}</span></p>
          <p><span className="text-mc-aqua">●</span> Arcade Wins: <span className="text-mc-aqua">{arcade.wins}</span></p>
        </Box>
      </div>
      {rows.slice(0, 2).map((row, index) => row.map(([game, wins]) => (
        <TableData
          key={game}
          title={game}
          value={wins}
          color={colors[index]}
        />
      )))}
    </div>
  );
}

