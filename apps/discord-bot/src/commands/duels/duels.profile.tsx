/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  BedWarsDuelsTable,
  BridgeDuelsTable,
  MultiDuelsGameModeTable,
  SingleDuelsGameModeTable,
  TitlesTable, 
} from "./tables/index.js";
import { Container, Footer, Header, SidebarItem, formatProgression } from "#components";
import { DuelsModes, FormattedGame, type GameMode } from "@statsify/schemas";
import { prettify } from "@statsify/util";
import type { BaseProfileProps, ProfileTime } from "#commands/base.hypixel-command";
import type { DuelsModeIcons } from "./duels.command.js";

export type DuelsProfileProps<T extends ProfileTime> = Omit<BaseProfileProps, "time"> & {
  mode: GameMode<DuelsModes>;
  time: T;
  modeIcons: T extends "LIVE" ? DuelsModeIcons : undefined;
};

export const DuelsProfile = <T extends ProfileTime>({
  skin,
  player,
  background,
  logo,
  user,
  badge,
  mode,
  t,
  time,
  modeIcons,
}: DuelsProfileProps<T>) => {
  const { duels } = player.stats;

  const sidebar: SidebarItem[] = [
    [t("stats.tokens"), t(duels.tokens), "§2"],
    [t("stats.pingRange"), `${t(duels.pingRange)}ms`, "§a"],
    [t("stats.blocksPlaced"), t(duels.overall.blocksPlaced), "§9"],
  ];

  const stats = duels[mode.api];

  if ("shotsFired" in stats) {
    sidebar.push([t("stats.shotsFired"), t(stats.shotsFired), "§6"]);
  } else if ("overall" in stats && "shotsFired" in stats.overall) {
    sidebar.push([t("stats.shotsFired"), t(stats.overall.shotsFired), "§6"]);
  }

  if ("headshots" in stats)
    sidebar.push([t("stats.headshots"), t(stats.headshots), "§3"]);

  if ("kit" in stats)
    sidebar.push([t("stats.kit"), prettify(stats.kit), "§e"]);

  const isTitles = time === "LIVE" && mode.api === "overall" && mode.submode.api === "titles";

  let table: JSX.Element;

  switch (mode.api) {
    case "bridge":
      table = <BridgeDuelsTable stats={duels[mode.api][mode.submode.api]} t={t} time={time} />;
      break;

    case "uhc":
      table = <SingleDuelsGameModeTable stats={duels[mode.api][mode.submode.api]} t={t} time={time} />;
      break;

    case "bedwars":
      sidebar.push([t("stats.itemsPurchased"), t(duels.bedwars.overall.itemsPurchased), "§d"]);
      table = mode.submode.api === "overall" ? <BedWarsDuelsTable stats={duels[mode.api][mode.submode.api]} t={t} time={time} /> : <SingleDuelsGameModeTable stats={duels[mode.api][mode.submode.api]} t={t} time={time} />;
      break;

    case "skywars":
    case "op":
    case "classic":
      table = <MultiDuelsGameModeTable stats={duels[mode.api]} t={t} time={time} />;
      break;

    case "spleef":
      if (mode.submode.api === "spleef") sidebar.push([t("stats.blocksBroken"), t(duels.spleef.spleef.blocksBroken), "§b"]);
      table = <SingleDuelsGameModeTable stats={duels[mode.api][mode.submode.api]} t={t} time={time} />;
      break;

    case "overall":
      // ensures the profile is not a historical one so modeIcons is defined
      table = isTitles ?
        <TitlesTable duels={duels} t={t} modeIcons={modeIcons!} /> :
        <SingleDuelsGameModeTable stats={duels[mode.api]} t={t} time={time} />;
      break;

    default:
      table = <SingleDuelsGameModeTable stats={duels[mode.api]} t={t} time={time} />;
      break;
  }

  let formattedMode;

  if (mode.api === "overall") {
    formattedMode = mode.submode.api === "stats" ? "Overall" : mode.submode.formatted;
  } else if ((mode.api === "bedwars" || mode.api ==="spleef" )&& mode.submode.api !== "overall") {
    formattedMode = mode.submode.formatted;
  } else {
    formattedMode = `${mode.formatted}${mode.submode ? ` ${mode.submode.formatted}` : ""}`;
  }

  return (
    <Container background={background}>
      <Header
        skin={skin}
        name={player.prefixName}
        badge={badge}
        sidebar={isTitles ? [] : sidebar}
        title={`§l${FormattedGame.DUELS} §fStats §r(${formattedMode})`}
        description={isTitles ?
          undefined :
          `§7${t("stats.title")}: ${
            duels[mode.api].titleFormatted
          }\n${formatProgression({
            t,
            label: t("stats.progression.win"),
            progression: duels[mode.api].progression,
            currentLevel: duels[mode.api].titleLevelFormatted,
            nextLevel: duels[mode.api].nextTitleLevelFormatted,
          })}`}
        time={time}
      />
      {table}
      <Footer logo={logo} user={user} />
    </Container>
  );
};
