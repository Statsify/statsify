/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ArcadeModes, DisasterSurvivals, Disasters, DisastersDeaths, SubModeForMode } from "@statsify/schemas";
import { LocalizeFunction } from "@statsify/discord";
import { Table } from "#components";
import { arrayGroup, formatTime } from "@statsify/util";

interface DisastersTableProps {
  stats: Disasters;
  submode: SubModeForMode<ArcadeModes, "disasters">;
  t: LocalizeFunction;
}

export const DisastersTable = ({ stats, t, submode }: DisastersTableProps) => {
  if (submode.api === "survivals") return <DisastersSurvivalsTable stats={stats} t={t} />;
  if (submode.api === "deaths") return <DisastersDeathsTable stats={stats} t={t} />;

  return (
    <Table.table>
      <Table.tr>
        <Table.td title={t("stats.wins")} value={t(stats.wins)} color="§a" />
        <Table.td title={t("stats.losses")} value={t(stats.losses)} color="§c" />
        <Table.td title={t("stats.wlr")} value={t(stats.wlr)} color="§6" />
      </Table.tr>
      <Table.tr>
        <Table.td title={t("stats.gamesPlayed")} value={t(stats.gamesPlayed)} color="§e" />
        <Table.td title={t("stats.playtime")} value={formatTime(stats.playtime)} color="§b" />
      </Table.tr>
    </Table.table>
  );
};

const DisasterSurvivalsLabels: Record<keyof DisasterSurvivals, string> = {
  acidRain: "§l§aACID RAIN",
  anvilRain: "§l§7ANVIL RAIN §7[S]",
  batSwarm: "§l§8BAT SWARM §7[S]",
  blackout: "§l§5BLACKOUT §7[S]",
  disco: "§l§dDISCO §7[S]",
  dragons: "§l§5DRAGONS",
  flood: "§l§9FLOOD",
  fragileGround: "§l§7FRAGILE GROUND",
  grounded: "§l§2GROUNDED §7[S]",
  halfHealth: "§l§aHALF HEALTH §7[S]",
  hotPotato: "§l§6HOT POTATO §7[S]",
  hypixelSays: "§l§6HYPIXEL SAYS §7[S]",
  lightning: "§l§eLIGHTNING",
  meteorShower: "§l§cMETEOR SHOWER",
  nuke: "§l§cNUKE §7[S]",
  purge: "§l§aPURGE §7[S]",
  redLightGreenLight: "§l§cRED LIGHT§r§f, §l§aGREEN LIGHT §7[S]",
  sinkhole: "§l§6SINKHOLE",
  solarFlare: "§l§6SOLAR FLARE",
  stampede: "§l§6STAMPEDE",
  swappage: "§l§dSWAPPAGE §7[S]",
  theFloorIsLava: "§l§cTHE FLOOR IS LAVA",
  tntRain: "§l§4TNT RAIN",
  tornado: "§l§7TORNADO",
  werewolf: "§l§cWEREWOLF §7[S]",
  withers: "§l§3WITHERS",
  zombieApocalypse: "§l§2ZOMBIE APOCALYPSE",
};

const DisastersSurvivalsTable = ({ stats, t }: Omit<DisastersTableProps, "submode">) => {
  const rows = arrayGroup(Object.entries(DisasterSurvivalsLabels) as [keyof DisasterSurvivals, string][], 2);

  return (
    <>
      {rows.map((row) => (
        <Table.tr>
          {row.map(([key, label]) => <Table.td title={label} value={t(stats.survivals[key])} size="inline" color="§f" />)}
        </Table.tr>
      ))}
    </>
  );
};

const DisastersDeathsLabels: Record<keyof DisastersDeaths, string> = {
  acidRain: "§l§aACID RAIN",
  anvilRain: "§l§7ANVIL RAIN §7[S]",
  batSwarm: "§l§8BAT SWARM §7[S]",
  disco: "§l§dDISCO §7[S]",
  dragons: "§l§5DRAGONS",
  fall: "§l§eFALL",
  flood: "§l§9FLOOD",
  hotPotato: "§l§6HOT POTATO §7[S]",
  hypixelSays: "§l§6HYPIXEL SAYS §7[S]",
  lightning: "§l§eLIGHTNING",
  nuke: "§l§cNUKE §7[S]",
  redLightGreenLight: "§l§cRED LIGHT§r§f, §l§aGREEN LIGHT §7[S]",
  sinkhole: "§l§6SINKHOLE",
  solarFlare: "§l§6SOLAR FLARE",
  stampede: "§l§6STAMPEDE",
  theFloorIsLava: "§l§cTHE FLOOR IS LAVA",
  tntRain: "§l§4TNT RAIN",
  tornado: "§l§7TORNADO",
  unknown: "§l§4UNKNOWN",
  void: "§l§5VOID",
  werewolf: "§l§cWEREWOLF §7[S]",
  withers: "§l§3WITHERS",
  zombieApocalypse: "§l§2ZOMBIE APOCALYPSE",
};

const DisastersDeathsTable = ({ stats, t }: Omit<DisastersTableProps, "submode">) => {
  const rows = arrayGroup(Object.entries(DisastersDeathsLabels) as [keyof DisastersDeaths, string][], 2);

  return (
    <>
      {rows.map((row) => (
        <Table.tr>
          {row.map(([key, label]) => <Table.td title={label} value={t(stats.deaths[key])} size="inline" color="§f" />)}
        </Table.tr>
      ))}
    </>
  );
};
