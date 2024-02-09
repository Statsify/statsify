/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  BridgeDuelsTable,
  MultiDuelsGameModeTable,
  SingleDuelsGameModeTable,
  UHCDuelsTable,
} from "./tables/index.js";
import { Container, Footer, Header, SidebarItem, formatProgression } from "#components";
import { DuelsModes, FormattedGame, GameMode } from "@statsify/schemas";
import type { BaseProfileProps } from "#commands/base.hypixel-command";

export interface DuelsProfileProps extends BaseProfileProps {
  mode: GameMode<DuelsModes>;
}

export const DuelsProfile = ({
  skin,
  player,
  background,
  logo,
  user,
  badge,
  mode,
  t,
  time,
}: DuelsProfileProps) => {
  const { duels } = player.stats;

  const sidebar: SidebarItem[] = [
    [t("stats.tokens"), t(duels.tokens), "§2"],
    [t("stats.pingRange"), `${t(duels.pingRange)}ms`, "§a"],
    [t("stats.blocksPlaced"), t(duels.overall.blocksPlaced), "§9"],
  ];

  let table: JSX.Element;
  const { api } = mode;

  switch (api) {
    case "bridge":
      table = <BridgeDuelsTable stats={duels[api]} t={t} />;
      break;

    case "uhc":
      table = <UHCDuelsTable stats={duels[api]} t={t} time={time} />;
      break;

    case "skywars":
    case "op":
    case "megawalls":
      table = <MultiDuelsGameModeTable stats={duels[api]} t={t} time={time} />;
      break;

    default:
      table = <SingleDuelsGameModeTable stats={duels[api]} t={t} time={time} />;
      break;
  }

  return (
    <Container background={background}>
      <Header
        skin={skin}
        name={player.prefixName}
        badge={badge}
        sidebar={sidebar}
        title={`§l${FormattedGame.DUELS} §fStats §r(${mode.formatted})`}
        description={`§7${t("stats.title")}: ${
          duels[api].titleFormatted
        }\n${formatProgression({
          t,
          label: t("stats.progression.win"),
          progression: duels[api].progression,
          currentLevel: duels[api].titleLevelFormatted,
          nextLevel: duels[api].nextTitleLevelFormatted,
        })}`}
        time={time}
      />
      {table}
      <Footer logo={logo} user={user} />
    </Container>
  );
};
