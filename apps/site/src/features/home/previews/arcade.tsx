/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Box } from "~/components/ui/box";
import { Link } from "@tanstack/react-router";
import { MinecraftText } from "~/components/ui/minecraft-text";
import { Nametag } from "~/components/ui/nametag";
import { Sidebar, SidebarItem } from "~/components/ui/sidebar";
import { Skin } from "~/components/ui/skin";
import { TableData } from "~/components/ui/table";
import { cn } from "~/lib/util";
import { useNumberFormat } from "~/i18n/use-number-format";
import { usePlayer } from "~/components/player-context";
import type { ArcadePreview } from "@statsify/contract";

export function arrayGroup<T extends unknown[] | string>(
  arr: T,
  groupSize: number
): T[] {
  return Array.from({ length: Math.ceil(arr.length / groupSize) }, (_, i) =>
    arr.slice(i * groupSize, (i + 1) * groupSize)
  ) as T[];
}

export function ArcadePreview({ className }: { className?: string }) {
  const arcade = usePlayer<ArcadePreview>();
  const n = useNumberFormat();

  const games: [string, number][] = [
    ["Blocking Dead", arcade.gameWins.blockingDead],
    ["Bounty Hunters", arcade.gameWins.bountyHunters],
    ["Disasters", arcade.gameWins.disasters],
    ["Dragon Wars", arcade.gameWins.dragonWars],
    ["Dropper", arcade.gameWins.dropper],
    ["Ender Spleef", arcade.gameWins.enderSpleef],
    ["Farm Hunt", arcade.gameWins.farmHunt],
    ["Football", arcade.gameWins.football],
    ["Galaxy Wars", arcade.gameWins.galaxyWars],
    ["Hide And Seek", arcade.gameWins.hideAndSeek],
    ["Hole In The Wall", arcade.gameWins.holeInTheWall],
    ["Hypixel Says", arcade.gameWins.hypixelSays],
    ["Mini Walls", arcade.gameWins.miniWalls],
    ["Party Games", arcade.gameWins.partyGames],
    ["Pixel Painters", arcade.gameWins.pixelPainters],
    ["Pixel Party", arcade.gameWins.pixelParty],
    ["Seasonal", arcade.gameWins.seasonal],
    ["Throw Out", arcade.gameWins.throwOut],
    ["Zombies", arcade.gameWins.zombies],
  ];

  games.sort((a, b) => b[1] - a[1]);

  const rows = arrayGroup(games, 3);
  const colors = [
    "text-mc-aqua",
    "text-mc-green",
    "text-mc-yellow",
    "text-mc-gold",
    "text-mc-red",
  ];

  return (
    <div className={cn("grid grid-cols-3 gap-2 sm:whitespace-nowrap", className)}>
      <div className="col-span-3 grid grid-cols-1 xl:grid-cols-balanced gap-2 text-center">
        <Skin
          uuid={arcade.uuid}
          className="xl:row-start-1 xl:row-end-4 hidden xl:block"
        />
        <Link to="/{-$locale}/player/$name" params={{ name: arcade.uuid }} className="row-start-1 xl:col-start-2 hover:underline">
          <Nametag prefixName={arcade.prefixName} />
        </Link>
        <Box className="row-start-3 xl:row-start-2 xl:row-span-2 xl:col-start-2">
          <Link to="/{-$locale}/player/$name/$game" params={{ name: arcade.uuid, game: "arcade" }} className="hover:underline">
            <span className="font-bold">
              <MinecraftText>§cA§6r§ec§aa§bd§de§f</MinecraftText> Wins
            </span>{" "}
            (Overall)
          </Link>
        </Box>
        <Sidebar className="row-start-2 xl:row-start-1 xl:row-end-4">
          <SidebarItem
            color="text-mc-gold"
            name="Coins"
            value={n(arcade.coins)}
          />
          <SidebarItem
            color="text-mc-yellow"
            name="Conversions"
            value={n(arcade.coinConversions)}
          />
          <SidebarItem
            color="text-mc-aqua"
            name="Arcade Wins"
            value={n(arcade.wins)}
          />
        </Sidebar>
      </div>
      {rows
        .slice(0, 2)
        .map((row, index) =>
          row.map(([game, wins]) => (
            <TableData
              key={game}
              title={game}
              value={n(wins)}
              color={colors[index]}
            />
          ))
        )}
    </div>
  );
}
