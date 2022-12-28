/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { BaseProfileProps } from "../base.hypixel-command";
import { Container, Footer, Header, SidebarItem, Table } from "#components";
import { FormattedGame, GameMode, WarlordsModes } from "@statsify/schemas";
import { WarlordsClassTable } from "./tables";
import { prettify } from "@statsify/util";

export interface WarlordsProfileProps extends BaseProfileProps {
  mode: GameMode<WarlordsModes>;
}

export const WarlordsProfile = ({
  player,
  background,
  logo,
  skin,
  t,
  badge,
  user,
  mode,
  time,
}: WarlordsProfileProps) => {
  const { warlords } = player.stats;

  const sidebar: SidebarItem[] = [
    [t("stats.coins"), t(warlords.coins), "§6"],
    [t("stats.class"), prettify(warlords.class), "§e"],
  ];

  let table: JSX.Element;

  switch (mode.api) {
    case "overall": {
      table = (
        <Table.table>
          <Table.tr>
            <Table.td title={t("stats.wins")} value={t(warlords.wins)} color="§a" />
            <Table.td title={t("stats.losses")} value={t(warlords.losses)} color="§c" />
            <Table.td title={t("stats.wlr")} value={t(warlords.wlr)} color="§6" />
            <Table.td
              title={t("stats.gamesPlayed")}
              value={t(warlords.gamesPlayed)}
              color="§e"
            />
          </Table.tr>
          <Table.tr>
            <Table.td title={t("stats.kills")} value={t(warlords.kills)} color="§a" />
            <Table.td title={t("stats.deaths")} value={t(warlords.deaths)} color="§c" />
            <Table.td title={t("stats.kdr")} value={t(warlords.kdr)} color="§6" />
            <Table.td title={t("stats.assists")} value={t(warlords.assists)} color="§e" />
          </Table.tr>
        </Table.table>
      );
      break;
    }
    case "classes": {
      table = <WarlordsClassTable warlords={warlords} t={t} />;
      break;
    }
  }

  return (
    <Container background={background}>
      <Header
        skin={skin}
        name={player.prefixName}
        badge={badge}
        sidebar={sidebar}
        title={`§l${FormattedGame.WARLORDS} §fStats §r(${mode.formatted})`}
        time={time}
      />
      {table}
      <Footer logo={logo} user={user} />
    </Container>
  );
};
