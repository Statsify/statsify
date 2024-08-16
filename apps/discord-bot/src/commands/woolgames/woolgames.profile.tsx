/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { CaptureTheWoolTable } from "./capture-the-wool.table.js";
import {
  Container,
  Footer,
  Header,
  Historical,
  SidebarItem,
  Table,
  formatProgression,
} from "#components";
import {
  FormattedGame,
  GameMode,
  WoolGamesModes,
} from "@statsify/schemas";
import { SheepWarsTable } from "./sheepwars.table.js";
import { WoolWarsTable } from "./woolwars.table.js";
import { formatTime } from "@statsify/util";
import type { BaseProfileProps } from "#commands/base.hypixel-command";

export interface WoolGamesProfileProps extends BaseProfileProps {
  mode: GameMode<WoolGamesModes>;
}

export const WoolGamesProfile = ({
  skin,
  player,
  background,
  logo,
  user,
  badge,
  mode,
  t,
  time,
}: WoolGamesProfileProps) => {
  const { woolgames } = player.stats;

  const sidebar: SidebarItem[] = [
    [t("stats.wool"), t(woolgames.coins), "§6"],
    [t("stats.layers"), `${t(woolgames.layers)}§8/§a${t(100)}`, "§a"],
    [t("stats.playtime"), formatTime(woolgames.playtime), "§d"],
  ];

  let table;

  switch (mode.api) {
    case "woolwars":
      table = <WoolWarsTable woolwars={woolgames[mode.api]} t={t} />;
      sidebar.push(
        [t("stats.woolPlaced"), t(woolgames.woolwars.overall.woolPlaced), "§e"],
        [t("stats.blocksBroken"), t(woolgames.woolwars.overall.blocksBroken), "§c"],
        [t("stats.powerups"), t(woolgames.woolwars.overall.powerups), "§b"]
      );
      break;

    case "captureTheWool":
      table = <CaptureTheWoolTable captureTheWool={woolgames[mode.api]} t={t} time={time} />;
      sidebar.push(
        [t("stats.goldEarned"), t(woolgames.captureTheWool.goldEarned), "§6"],
        [t("stats.goldSpent"), t(woolgames.captureTheWool.goldSpent), "§6"]
      );
      break;

    case "sheepwars":
      table = <SheepWarsTable sheepwars={woolgames[mode.api]} t={t} />;
      break;
  }

  return (
    <Container background={background}>
      <Header
        skin={skin}
        name={player.prefixName}
        badge={badge}
        sidebar={sidebar}
        title={`§l${FormattedGame.WOOLGAMES} §fStats §r(${mode.formatted})`}
        description={`§7${t("stats.level")}: ${
          woolgames.levelFormatted
        }\n${formatProgression({
          t,
          label: t("stats.progression.exp"),
          progression: woolgames.progression,
          currentLevel: woolgames.levelFormatted,
          nextLevel: woolgames.nextLevelFormatted,
        })}`}
        time={time}
      />
      <Table.table>
        {table}
        <Historical.progression
          time={time}
          progression={woolgames.progression}
          current={woolgames.levelFormatted}
          next={woolgames.nextLevelFormatted}
          t={t}
          level={woolgames.level}
          exp={woolgames.exp}
        />
      </Table.table>
      <Footer logo={logo} user={user} />
    </Container>
  );
};
