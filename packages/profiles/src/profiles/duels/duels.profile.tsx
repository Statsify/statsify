/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
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
import { Container, Footer, Header, SidebarItem, formatProgression } from "../../components/index.js";
import { DUELS, cardColours } from "@statsify/catalog";
import { DuelsModes, FormattedGame, type GameMode } from "@statsify/schemas";
import { formatRecordTime, prettify } from "@statsify/util";
import type { BaseProfileProps, ProfileTime } from "../../types.js";
import type { DuelsModeIcons } from "./tables/index.js";

export type { DuelsModeIcons } from "./tables/index.js";

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
  const colour = cardColours(DUELS);

  const sidebar: SidebarItem[] = [
    [t("stats.tokens"), t(duels.tokens), colour("tokens")],
    [t("stats.pingRange"), `${t(duels.pingRange)}ms`, colour("pingRange")],
    [t("stats.blocksPlaced"), t(duels.overall.blocksPlaced), colour("overall.blocksPlaced")],
  ];

  const stats = duels[mode.api];

  if ("shotsFired" in stats) {
    sidebar.push([t("stats.shotsFired"), t(stats.shotsFired), colour(`${mode.api}.shotsFired`)]);
  } else if ("overall" in stats && "shotsFired" in stats.overall) {
    sidebar.push([t("stats.shotsFired"), t(stats.overall.shotsFired), colour(`${mode.api}.overall.shotsFired`)]);
  }

  if ("headshots" in stats)
    sidebar.push([t("stats.headshots"), t(stats.headshots), colour(`${mode.api}.headshots`)]);

  if ("kit" in stats)
    sidebar.push([t("stats.kit"), prettify(stats.kit), colour(`${mode.api}.kit`)]);

  if (mode.api === "parkour") {
    if (time === "LIVE")
      sidebar.push([t("stats.bestTime"), formatRecordTime(duels.parkour.bestTime), colour("parkour.bestTime")]);

    sidebar.push([t("stats.checkpoints"), t(duels.parkour.checkpoints), colour("parkour.checkpoints")]);
  }

  const isTitles = time === "LIVE" && mode.api === "overall" && mode.submode.api === "titles";

  let table: JSX.Element;

  switch (mode.api) {
    case "bridge":
      table = <BridgeDuelsTable stats={duels[mode.api][mode.submode.api]} place={`${mode.api}.${mode.submode.api}`} t={t} time={time} />;
      break;

    case "uhc":
      table = <SingleDuelsGameModeTable stats={duels[mode.api][mode.submode.api]} place={`${mode.api}.${mode.submode.api}`} t={t} time={time} />;
      break;

    case "bedwars":
      sidebar.push([t("stats.itemsPurchased"), t(duels.bedwars.overall.itemsPurchased), colour("bedwars.overall.itemsPurchased")]);
      table = mode.submode.api === "overall" ? <BedWarsDuelsTable stats={duels[mode.api][mode.submode.api]} t={t} time={time} /> : <SingleDuelsGameModeTable stats={duels[mode.api][mode.submode.api]} place={`${mode.api}.${mode.submode.api}`} t={t} time={time} />;
      break;

    case "skywars":
    case "op":
    case "classic":
      table = <MultiDuelsGameModeTable stats={duels[mode.api]} place={mode.api} t={t} time={time} />;
      break;

    case "spleef":
      if (mode.submode.api === "spleef") sidebar.push([t("stats.blocksBroken"), t(duels.spleef.spleef.blocksBroken), colour("spleef.spleef.blocksBroken")]);
      table = <SingleDuelsGameModeTable stats={duels[mode.api][mode.submode.api]} place={`${mode.api}.${mode.submode.api}`} t={t} time={time} />;
      break;

    case "overall":
      // ensures the profile is not a historical one so modeIcons is defined
      table = isTitles ?
        <TitlesTable duels={duels} t={t} modeIcons={modeIcons!} /> :
        <SingleDuelsGameModeTable stats={duels[mode.api]} place={mode.api} t={t} time={time} />;
      break;

    default:
      table = <SingleDuelsGameModeTable stats={duels[mode.api]} place={mode.api} t={t} time={time} />;
      break;
  }

  let formattedMode;

  if (mode.api === "overall") {
    formattedMode = mode.submode.api === "stats" ? "Overall" : mode.submode.formatted;
  } else if ((mode.api === "bedwars" || mode.api === "spleef") && mode.submode.api !== "overall") {
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
