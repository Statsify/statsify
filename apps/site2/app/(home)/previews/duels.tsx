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

export function DuelsPreview({ className }: { className?: string }) {
  const player = usePlayer();
  const duels = player.stats.duels;
  const stats = duels.overall;

  return (
    <div className={cn("grid grid-cols-3 gap-2 whitespace-nowrap", className)}>
      <div className="col-span-3 grid grid-cols-1 xl:grid-cols-[minmax(min-content,max-content)_1fr_minmax(min-content,max-content)] gap-2 text-center">
        <Skin uuid={player.uuid} containerClass="xl:row-start-1 xl:row-end-4 hidden xl:block" contentClass="h-full" />
        <Box containerClass="row-start-1 xl:col-start-2">
          <MinecraftText className="text-mc-4">{player.prefixName}</MinecraftText>
        </Box>
        <Box containerClass="text-mc-gray row-start-2 xl:col-start-2">
          <p>Title: <MinecraftText>{stats.titleFormatted}</MinecraftText></p>
          <p>Win Progress: <span className="text-mc-aqua">{stats.progression.current}</span>/<span className="text-mc-green">{stats.progression.max}</span></p>
          <p>
            <MinecraftText>{stats.titleLevelFormatted}</MinecraftText>
            {" "} <span className="text-mc-dark-gray">[</span><span className="text-mc-aqua">■■■■■■■</span>■■■<span className="text-mc-dark-gray">]</span> {" "}
            <MinecraftText>{stats.nextTitleLevelFormatted}</MinecraftText>
          </p>
        </Box>
        <Box containerClass="row-start-4 xl:row-start-3 xl:col-start-2">
          <span className="font-bold"><span className="text-mc-aqua">Duels</span> Stats</span> (Overall)
        </Box>
        <Box containerClass="row-start-3 xl:row-start-1 xl:row-end-4" contentClass="grid grid-cols-2 xl:flex xl:flex-col justify-center gap-2 text-start">
          <p><span className="text-mc-dark-green">●</span> Tokens: <span className="text-mc-dark-green">{duels.tokens}</span></p>
          <p><span className="text-mc-green">●</span> Coins: <span className="text-mc-green">{duels.pingRange}ms</span></p>
          <p><span className="text-mc-blue">●</span> Blocks: <span className="text-mc-blue">{stats.blocksPlaced}</span></p>
          <p><span className="text-mc-gold">●</span> Shots Fired: <span className="text-mc-gold">{stats.shotsFired}</span></p>
        </Box>
      </div>
      <TableData title="Wins" value={stats.wins} color="text-mc-green" />
      <TableData title="Losses" value={stats.losses} color="text-mc-red" />
      <TableData title="WLR" value={stats.wlr} color="text-mc-gold" />
    </div>
  );
}

