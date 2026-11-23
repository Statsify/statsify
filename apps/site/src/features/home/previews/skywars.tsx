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
import type { SkyWarsPreview } from "@statsify/contract";

export function SkyWarsPreview({ className }: { className?: string }) {
  const skywars = usePlayer<SkyWarsPreview>();
  const n = useNumberFormat();
  const { t } = useTranslation();
  const stats = skywars.overall;

  return (
    <div className={cn("grid grid-cols-3 gap-2 sm:whitespace-nowrap", className)}>
      <div className="col-span-3 grid grid-cols-1 xl:grid-cols-balanced gap-2 text-center">
        <Skin uuid={skywars.uuid} className="xl:row-start-1 xl:row-end-4 hidden xl:block" />
        <Link to="/{-$locale}/player/$name" params={{ name: skywars.uuid }} className="row-start-1 xl:col-start-2 hover:underline">
          <Nametag prefixName={skywars.prefixName} />
        </Link>
        <Progression
          className="row-start-2 xl:col-start-2"
          label="Level"
          metric="EXP"
          progression={skywars.progression}
          currentLevel={skywars.levelFormatted}
          naturalLevel={skywars.naturalLevelFormatted}
          nextLevel={skywars.nextLevelFormatted}
        />
        <Box className="row-start-4 xl:row-start-3 xl:col-start-2">
          <Link to="/{-$locale}/player/$name/$game" params={{ name: skywars.uuid, game: "skywars" }} className="hover:underline">
            <span className="font-bold"><span className="text-mc-aqua">Sky</span><span className="text-mc-yellow">Wars</span> {t("home.stats")}</span> (Overall)
          </Link>
        </Box>
        <Sidebar className="row-start-3 xl:row-start-1 xl:row-end-4">
          <SidebarItem color="text-mc-gold" name="Coins" value={n(skywars.coins)} />
          <SidebarItem color="text-mc-dark-green" name="Tokens" value={n(skywars.tokens)} />
          <SidebarItem color="text-mc-aqua" name="Souls" value={n(skywars.souls)} />
          <SidebarItem color="text-mc-blue" name="Opals" value={n(skywars.opals)} />
          <SidebarItem color="text-mc-dark-purple" name="Heads" value={n(skywars.heads)} />
          <SidebarItem color="text-mc-pink" name="Potions Brewed" value={n(skywars.potionsBrewed)} />
        </Sidebar>
      </div>
      <TableData title={t("default:stats.wins")} value={n(stats.wins)} color="text-mc-green" />
      <TableData title={t("default:stats.losses")} value={n(stats.losses)} color="text-mc-red" />
      <TableData title="WLR" value={n(stats.wlr)} color="text-mc-gold" />
    </div>
  );
}
