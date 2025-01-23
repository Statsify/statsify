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
import { usePlayer } from "~/app/players/[slug]/context";

export function BedWarsPreview() {
  const player = usePlayer();
  const bedwars = player.stats.bedwars;
  const stats = bedwars.overall;

  return (
    <div className="grid grid-cols-3 w-fit gap-4">
      <div className="col-span-3 flex gap-4">
        <Skin uuid={player.uuid} className="h-full" />
        <div className="flex flex-col gap-4 grow text-center">
          <Box>
            <MinecraftText className="text-mc-4">{player.prefixName}</MinecraftText>
          </Box>
          <Box containerClass="text-mc-gray">
            <p>Level: <MinecraftText>{bedwars.levelFormatted}</MinecraftText></p>
            <p>EXP Progress: <span className="text-mc-aqua">{bedwars.progression.current}</span>/<span className="text-mc-green">{bedwars.progression.max}</span></p>
            <p>
              <MinecraftText>{bedwars.levelFormatted}</MinecraftText>
              {" "} <span className="text-mc-dark-gray">[</span><span className="text-mc-aqua">■■■■■■■</span>■■■<span className="text-mc-dark-gray">]</span> {" "}
              <MinecraftText>{bedwars.nextLevelFormatted}</MinecraftText>
            </p>
          </Box>
          <Box>
            <span className="font-bold"><span className="text-mc-red">Bed</span>Wars Stats</span> (Overall)
          </Box>
        </div>
        <Box contentClass="flex flex-col justify-center gap-2">
          <p><span className="text-mc-dark-green">●</span> Tokens: <span className="text-mc-dark-green">{bedwars.tokens}</span></p>
          <p><span className="text-mc-gray">●</span> Iron: <span className="text-mc-gray">{stats.itemsCollected.iron}</span></p>
          <p><span className="text-mc-gold">●</span> Gold: <span className="text-mc-gold">{stats.itemsCollected.gold}</span></p>
          <p><span className="text-mc-aqua">●</span> Diamonds: <span className="text-mc-aqua">{stats.itemsCollected.diamond}</span></p>
          <p><span className="text-mc-dark-green">●</span> Emeralds: <span className="text-mc-dark-green">{stats.itemsCollected.emerald}</span></p>
          <p><span className="text-mc-green">●</span> Winstreak: <span className="text-mc-green">{stats.winstreak}</span></p>
        </Box>
      </div>
      <TableData title="Wins" value={stats.wins} color="text-mc-green" />
      <TableData title="Losses" value={stats.losses} color="text-mc-red" />
      <TableData title="WLR" value={stats.wlr} color="text-mc-gold" />
    </div>
  );
}

