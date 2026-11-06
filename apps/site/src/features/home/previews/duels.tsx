/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Box } from "~/components/ui/box";
import { Link } from "@tanstack/react-router";
import { Nametag } from "~/components/ui/nametag";
import { Progression } from "~/components/ui/progression";
import { Sidebar, SidebarItem } from "~/components/ui/sidebar";
import { Skin } from "~/components/ui/skin";
import { TableData } from "~/components/ui/table";
import { cn } from "~/lib/util";
import { useTranslation } from "react-i18next";
import { useNumberFormat } from "~/i18n/use-number-format";
import { usePlayer } from "~/components/player-context";
import type { DuelsPreview } from "@statsify/contract";

export function DuelsPreview({ className }: { className?: string }) {
  const duels = usePlayer<DuelsPreview>();
  const n = useNumberFormat();
  const { t } = useTranslation();
  const stats = duels.overall;

  return (
    <div className={cn("grid grid-cols-3 gap-2 sm:whitespace-nowrap", className)}>
      <div className="col-span-3 grid grid-cols-1 xl:grid-cols-balanced gap-2 text-center">
        <Skin uuid={duels.uuid} className="xl:row-start-1 xl:row-end-4 hidden xl:block" />
        <Link to="/{-$locale}/player/$name" params={{ name: duels.uuid }} className="row-start-1 xl:col-start-2 hover:underline">
          <Nametag prefixName={duels.prefixName} />
        </Link>
        <Progression
          className="row-start-2 xl:col-start-2"
          label="Title"
          metric="Win"
          progression={stats.progression}
          currentLevel={stats.titleFormatted}
          naturalLevel={stats.titleLevelFormatted}
          nextLevel={stats.nextTitleLevelFormatted}
        />
        <Box className="row-start-4 xl:row-start-3 xl:col-start-2">
          <Link to="/{-$locale}/player/$name/$game" params={{ name: duels.uuid, game: "duels" }} className="hover:underline">
            <span className="font-bold"><span className="text-mc-aqua">Duels</span> {t("home.stats")}</span> (Overall)
          </Link>
        </Box>
        <Sidebar className="row-start-3 xl:row-start-1 xl:row-end-4">
          <SidebarItem color="text-mc-dark-green" name="Tokens" value={n(duels.tokens)} />
          <SidebarItem color="text-mc-green" name="Ping Range" value={`${duels.pingRange}ms`} />
          <SidebarItem color="text-mc-blue" name="Blocks" value={n(stats.blocksPlaced)} />
          <SidebarItem color="text-mc-gold" name="Shots Fired" value={n(stats.shotsFired)} />
        </Sidebar>
      </div>
      <TableData title={t("default:stats.wins")} value={n(stats.wins)} color="text-mc-green" />
      <TableData title={t("default:stats.losses")} value={n(stats.losses)} color="text-mc-red" />
      <TableData title="WLR" value={n(stats.wlr)} color="text-mc-gold" />
    </div>
  );
}
