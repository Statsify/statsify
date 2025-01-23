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

export function SkyWarsPreview({ className }: { className?: string }) {
  const player = usePlayer();
  const skywars = player.stats.skywars;
  const stats = skywars.overall;

  return (
    <div className={cn("grid grid-cols-3 gap-2 whitespace-nowrap", className)}>
      <div className="col-span-3 grid grid-cols-1 xl:grid-cols-[minmax(min-content,max-content)_1fr_minmax(min-content,max-content)] gap-2 text-center">
        <Skin uuid={player.uuid} containerClass="xl:row-start-1 xl:row-end-4 hidden xl:block" contentClass="h-full" />
        <Box containerClass="row-start-1 xl:col-start-2">
          <MinecraftText className="text-mc-4">{player.prefixName}</MinecraftText>
        </Box>
        <Box containerClass="text-mc-gray row-start-2 xl:col-start-2">
          <p>Level: <MinecraftText>{skywars.levelFormatted}</MinecraftText></p>
          <p>EXP Progress: <span className="text-mc-aqua">{skywars.progression.current}</span>/<span className="text-mc-green">{skywars.progression.max}</span></p>
          <p>
            <MinecraftText>{skywars.levelFormatted}</MinecraftText>
            {" "} <span className="text-mc-dark-gray">[</span><span className="text-mc-aqua">■■■■■■■</span>■■■<span className="text-mc-dark-gray">]</span> {" "}
            <MinecraftText>{skywars.nextLevelFormatted}</MinecraftText>
          </p>
        </Box>
        <Box containerClass="row-start-4 xl:row-start-3 xl:col-start-2">
          <span className="font-bold"><span className="text-mc-aqua">Sky</span><span className="text-mc-yellow">Wars</span> Stats</span> (Overall)
        </Box>
        <Box containerClass="row-start-3 xl:row-start-1 xl:row-end-4" contentClass="grid grid-cols-2 xl:flex xl:flex-col justify-center gap-2 text-start">
          <p><span className="text-mc-gold">●</span> Coins: <span className="text-mc-gold">{skywars.coins}</span></p>
          <p><span className="text-mc-dark-green">●</span> Tokens: <span className="text-mc-dark-green">{skywars.tokens}</span></p>
          <p><span className="text-mc-aqua">●</span> Souls: <span className="text-mc-aqua">{skywars.souls}</span></p>
          <p><span className="text-mc-blue">●</span> Opals: <span className="text-mc-blue">{skywars.opals}</span></p>
          <p><span className="text-mc-dark-purple">●</span> Heads: <span className="text-mc-dark-purple">{skywars.heads}</span></p>
          <p><span className="text-mc-pink">●</span> Potions Brewed: <span className="text-mc-pink">{skywars.potionsBrewed}</span></p>
        </Box>
      </div>
      <TableData title="Wins" value={stats.wins} color="text-mc-green" />
      <TableData title="Losses" value={stats.losses} color="text-mc-red" />
      <TableData title="WLR" value={stats.wlr} color="text-mc-gold" />
    </div>
  );
}

