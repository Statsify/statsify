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
import { Sidebar, SidebarItem } from "~/components/ui/sidebar";
import { Skin } from "~/components/ui/skin";
import { TableData } from "~/components/ui/table";
import { cn } from "~/lib/util";
import { usePlayer } from "~/app/players/[slug]/context";

export function BedWarsPreview({ className }: { className?: string }) {
  const player = usePlayer();
  const bedwars = player.stats.bedwars;
  const stats = bedwars.overall;

  return (
    <div className={cn("grid grid-cols-3 gap-2 whitespace-nowrap", className)}>
      <div className="col-span-3 grid grid-cols-1 xl:grid-cols-[minmax(min-content,max-content)_1fr_minmax(min-content,max-content)] gap-2 text-center">
        <Skin uuid={player.uuid} containerClass="xl:row-start-1 xl:row-end-4 hidden xl:block" contentClass="h-full" />
        <Box containerClass="row-start-1 xl:col-start-2">
          <MinecraftText className="text-mc-4">{player.prefixName}</MinecraftText>
        </Box>
        <Box containerClass="text-mc-gray row-start-2 xl:col-start-2">
          <p>Level: <MinecraftText>{bedwars.levelFormatted}</MinecraftText></p>
          <p>EXP Progress: <span className="text-mc-aqua">{bedwars.progression.current}</span>/<span className="text-mc-green">{bedwars.progression.max}</span></p>
          <p>
            <MinecraftText>{bedwars.levelFormatted}</MinecraftText>
            {" "} <span className="text-mc-dark-gray">[</span><span className="text-mc-aqua">■■■■■■■</span>■■■<span className="text-mc-dark-gray">]</span> {" "}
            <MinecraftText>{bedwars.nextLevelFormatted}</MinecraftText>
          </p>
        </Box>
        <Box containerClass="row-start-4 xl:row-start-3 xl:col-start-2">
          <span className="font-bold"><span className="text-mc-red">Bed</span>Wars Stats</span> (Overall)
        </Box>
        <Sidebar className="row-start-3 xl:row-start-1 xl:row-end-4">
          <SidebarItem color="text-mc-dark-green" name="Tokens" value={bedwars.tokens} />
          <SidebarItem color="text-mc-gray" name="Iron" value={stats.itemsCollected.iron} />
          <SidebarItem color="text-mc-gold" name="Gold" value={stats.itemsCollected.gold} />
          <SidebarItem color="text-mc-aqua" name="Diamonds" value={stats.itemsCollected.diamond} />
          <SidebarItem color="text-mc-dark-green" name="Emeralds" value={stats.itemsCollected.emerald} />
          <SidebarItem color="text-mc-green" name="Winstreak" value={stats.winstreak} />
        </Sidebar>
      </div>
      <TableData title="Wins" value={stats.wins} color="text-mc-green" />
      <TableData title="Losses" value={stats.losses} color="text-mc-red" />
      <TableData title="WLR" value={stats.wlr} color="text-mc-gold" />
    </div>
  );
}

