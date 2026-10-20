/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Box } from "~/components/ui/box";
import { Nametag } from "~/components/ui/nametag";
import { Progression } from "~/components/ui/progression";
import { Sidebar, SidebarItem } from "~/components/ui/sidebar";
import { Skin } from "~/components/ui/skin";
import { TableData } from "~/components/ui/table";
import { cn } from "~/lib/util";
import { useTranslation } from "react-i18next";
import { useNumberFormat } from "~/i18n/use-number-format";
import { usePlayer } from "~/components/player-context";

export function BedWarsPreview({ className }: { className?: string }) {
  const player = usePlayer();
  const n = useNumberFormat();
  const { t } = useTranslation();
  const bedwars = player.stats.bedwars;
  const stats = bedwars.overall;

  return (
    <div className={cn("grid grid-cols-3 gap-2 sm:whitespace-nowrap", className)}>
      <div className="col-span-3 grid grid-cols-1 xl:grid-cols-balanced gap-2 text-center">
        <Skin uuid={player.uuid} className="xl:row-start-1 xl:row-end-4 hidden xl:block" />
        <Nametag prefixName={player.prefixName} className="row-start-1 xl:col-start-2" />
        <Progression
          // A smaller size on phones keeps "[281✫] [■■■■■■■■■■] [282✫]" on one line, the card's three lines in proportion.
          className="row-start-2 xl:col-start-2 max-sm:content:text-mc-1.5"
          label="Level"
          metric="EXP"
          progression={bedwars.progression}
          currentLevel={bedwars.naturalLevelFormatted}
          nextLevel={bedwars.nextLevelFormatted}
        />
        <Box className="row-start-4 xl:row-start-3 xl:col-start-2">
          <span className="font-bold">
            <span className="text-mc-red">Bed</span>Wars Stats
          </span>{" "}
          (Overall)
        </Box>
        <Sidebar className="row-start-3 xl:row-start-1 xl:row-end-4">
          <SidebarItem color="text-mc-dark-green" name="Tokens" value={n(bedwars.tokens)} />
          <SidebarItem color="text-mc-gray" name="Iron" value={n(stats.itemsCollected.iron)} />
          <SidebarItem color="text-mc-gold" name="Gold" value={n(stats.itemsCollected.gold)} />
          <SidebarItem color="text-mc-aqua" name="Diamonds" value={n(stats.itemsCollected.diamond)} />
          <SidebarItem color="text-mc-dark-green" name="Emeralds" value={n(stats.itemsCollected.emerald)} />
          <SidebarItem color="text-mc-green" name="Winstreak" value={n(stats.winstreak)} />
        </Sidebar>
      </div>
      <TableData title={t("default:stats.wins")} value={n(stats.wins)} color="text-mc-green" />
      <TableData title={t("default:stats.losses")} value={n(stats.losses)} color="text-mc-red" />
      <TableData title="WLR" value={n(stats.wlr)} color="text-mc-gold" />
    </div>
  );
}
