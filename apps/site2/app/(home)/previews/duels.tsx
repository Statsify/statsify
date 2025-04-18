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

export function DuelsPreview({ className }: { className?: string }) {
  const player = usePlayer();
  const duels = player.stats.duels;
  const stats = duels.overall;

  return (
    <div className={cn("grid grid-cols-3 gap-2 whitespace-nowrap", className)}>
      <div className="col-span-3 grid grid-cols-1 xl:grid-cols-balanced gap-2 text-center">
        <Skin uuid={player.uuid} className="container:xl:row-start-1 container:xl:row-end-4 container:hidden container:xl:block h-full" />
        <Nametag className="container:row-start-1 container:xl:col-start-2" />
        <Progression
          className="container:row-start-2 container:xl:col-start-2"
          label="Title"
          metric="Win"
          progression={stats.progression}
          currentLevel={stats.titleLevelFormatted}
          nextLevel={stats.nextTitleLevelFormatted}
        />
        <Box className="container:row-start-4 container:xl:row-start-3 container:xl:col-start-2">
          <span className="font-bold"><span className="text-mc-aqua">Duels</span> Stats</span> (Overall)
        </Box>
        <Sidebar className="container:row-start-3 container:xl:row-start-1 container:xl:row-end-4">
          <SidebarItem color="text-mc-dark-green" name="Tokens" value={t(duels.tokens)} />
          <SidebarItem color="text-mc-green" name="Ping Range" value={`${duels.pingRange}ms`} />
          <SidebarItem color="text-mc-blue" name="Blocks" value={t(stats.blocksPlaced)} />
          <SidebarItem color="text-mc-gold" name="Shots Fired" value={t(stats.shotsFired)} />
        </Sidebar>
      </div>
      <TableData title="Wins" value={t(stats.wins)} color="text-mc-green" />
      <TableData title="Losses" value={t(stats.losses)} color="text-mc-red" />
      <TableData title="WLR" value={t(stats.wlr)} color="text-mc-gold" />
    </div>
  );
}

