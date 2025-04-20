/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

"use client";

import { Box } from "~/components/ui/box";
import { Nametag } from "~/components/ui/nametag";
import { Progression } from "~/components/ui/progression";
import { Sidebar, SidebarItem } from "~/components/ui/sidebar";
import { Skin } from "~/components/ui/skin";
import { TableData } from "~/components/ui/table";
import { cn } from "~/lib/util";
import { t } from "~/localize";
import { usePlayer } from "~/app/players/[slug]/context";

export function BedWarsPreview({ className }: { className?: string }) {
  const player = usePlayer();
  const bedwars = player.stats.bedwars;
  const stats = bedwars.overall;

  return (
    <div className={cn("grid grid-cols-3 gap-2 whitespace-nowrap", className)}>
      <div className="col-span-3 grid grid-cols-1 xl:grid-cols-balanced gap-2 text-center">
        <Skin uuid={player.uuid} className="xl:row-start-1 xl:row-end-4 hidden xl:block" />
        <Nametag className="row-start-1 xl:col-start-2" />
        <Progression
          className="row-start-2 xl:col-start-2"
          label="Level"
          metric="EXP"
          progression={bedwars.progression}
          currentLevel={bedwars.levelFormatted}
          nextLevel={bedwars.nextLevelFormatted}
        />
        <Box className="row-start-4 xl:row-start-3 xl:col-start-2">
          <span className="font-bold"><span className="text-mc-red">Bed</span>Wars Stats</span> (Overall)
        </Box>
        <Sidebar className="row-start-3 xl:row-start-1 xl:row-end-4">
          <SidebarItem color="text-mc-dark-green" name="Tokens" value={t(bedwars.tokens)} />
          <SidebarItem color="text-mc-gray" name="Iron" value={t(stats.itemsCollected.iron)} />
          <SidebarItem color="text-mc-gold" name="Gold" value={t(stats.itemsCollected.gold)} />
          <SidebarItem color="text-mc-aqua" name="Diamonds" value={t(stats.itemsCollected.diamond)} />
          <SidebarItem color="text-mc-dark-green" name="Emeralds" value={t(stats.itemsCollected.emerald)} />
          <SidebarItem color="text-mc-green" name="Winstreak" value={t(stats.winstreak)} />
        </Sidebar>
      </div>
      <TableData title="Wins" value={t(stats.wins)} color="text-mc-green" />
      <TableData title="Losses" value={t(stats.losses)} color="text-mc-red" />
      <TableData title="WLR" value={t(stats.wlr)} color="text-mc-gold" />
    </div>
  );
}

