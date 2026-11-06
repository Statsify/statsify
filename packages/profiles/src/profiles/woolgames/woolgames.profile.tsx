/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
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
} from "../../components/index.js";
import {
  FormattedGame,
  type GameMode,
  WoolGamesModes,
} from "@statsify/schemas";
import { SheepWarsTable } from "./sheepwars.table.js";
import { WOOL_GAMES, cardColours } from "@statsify/catalog";
import { WoolWarsTable } from "./woolwars.table.js";
import { formatTime } from "@statsify/util";
import type { BaseProfileProps } from "../../types.js";

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
  const colour = cardColours(WOOL_GAMES);

  const sidebar: SidebarItem[] = [
    [t("stats.wool"), t(woolgames.coins), colour("coins")],
    [t("stats.layers"), `${t(woolgames.layers)}§8/§a${t(100)}`, colour("layers")],
    [t("stats.playtime"), formatTime(woolgames.playtime), colour("playtime")],
  ];

  let table;

  switch (mode.api) {
    case "woolwars": {
      const stats = woolgames.woolwars[mode.submode.api];

      table = <WoolWarsTable woolwars={woolgames[mode.api]} submode={mode.submode} t={t} />;
      sidebar.push(
        [t("stats.woolPlaced"), t(stats.woolPlaced), colour("woolwars.overall.woolPlaced")],
        [t("stats.blocksBroken"), t(stats.blocksBroken), colour("woolwars.overall.blocksBroken")],
        [t("stats.powerups"), t(stats.powerups), colour("woolwars.overall.powerups")]
      );
      break;
    }

    case "captureTheWool":
      table = <CaptureTheWoolTable captureTheWool={woolgames[mode.api]} t={t} time={time} />;
      sidebar.push(
        [t("stats.goldEarned"), t(woolgames.captureTheWool.goldEarned), colour("captureTheWool.goldEarned")],
        [t("stats.goldSpent"), t(woolgames.captureTheWool.goldSpent), colour("captureTheWool.goldSpent")]
      );
      break;

    case "sheepwars":
      table = <SheepWarsTable sheepwars={woolgames[mode.api]} t={t} />;
      sidebar.push(
        [t("stats.magicWool"), t(woolgames.sheepwars.magicWool), colour("sheepwars.magicWool")],
        [t("stats.sheepThrown"), t(woolgames.sheepwars.sheepThrown), colour("sheepwars.sheepThrown")],
        [t("stats.sheepKilled"), t(woolgames.sheepwars.sheepKilled), colour("sheepwars.sheepKilled")]
      );
      break;
  }

  return (
    <Container background={background}>
      <Header
        skin={skin}
        name={player.prefixName}
        badge={badge}
        sidebar={sidebar}
        title={`§l${FormattedGame.WOOLGAMES} §fStats §r(${mode.formatted}${mode.submode ? ` ${mode.submode.formatted}` : ""})`}
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
