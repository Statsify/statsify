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

export function WoolWarsPreview({ className }: { className?: string }) {
  const player = usePlayer();
  const { woolwars } = player.stats.woolgames;
  const stats = woolwars.overall;

  return (
    <div className={cn("grid grid-cols-3 gap-2 whitespace-nowrap", className)}>
      <div className="col-span-3 grid grid-cols-[repeat(minmax(min-content,max-content),_2)] lg:grid-cols-[repeat(minmax(min-content,max-content),_3)] gap-2 text-center">
        <Skin uuid={player.uuid} containerClass="hidden lg:block lg:col-span-1 lg:row-span-3" contentClass="h-full" />
        <Box containerClass="col-span-2 col-start-1 lg:col-start-2">
          <MinecraftText className="text-mc-4">{player.prefixName}</MinecraftText>
        </Box>
        <Box containerClass="col-span-2">
          Started 02/13/2025 (23 days ago)
        </Box>
        <Box containerClass="font-bold">
          Session
        </Box>
        <Box>
          <span className="font-bold"><span className="text-mc-red">Wool</span><span className="text-mc-blue">Games</span> Stats</span> (Overall)
        </Box>
      </div>
      <TableData title="Wins" value={stats.wins} color="text-mc-green" />
      <TableData title="Losses" value={stats.losses} color="text-mc-red" />
      <TableData title="WLR" value={stats.wlr} color="text-mc-gold" />
    </div>
  );
}

