/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { BridgeModes, FormattedGame, GameMode } from "@statsify/schemas";
import {
  Container,
  Footer,
  Header,
  Historical,
  SidebarItem,
  Table,
  formatProgression,
} from "#components";
import type { BaseProfileProps } from "#commands/base.hypixel-command";

export interface BridgeProfileProps extends BaseProfileProps {
  mode: GameMode<BridgeModes>;
}

export const BridgeProfile = ({
  skin,
  player,
  background,
  logo,
  user,
  badge,
  mode,
  t,
  time,
}: BridgeProfileProps) => {
  const { duels } = player.stats;
  const { bridge } = duels;
  const stats = bridge[mode.api];

  const sidebar: SidebarItem[] = [
    [t("stats.pingRange"), `${t(duels.pingRange)}ms`, "§2"],
    [t("stats.goals"), t(stats.goals), "§c"],
    [t("stats.blocksPlaced"), t(stats.blocksPlaced), "§9"],
  ];

  return (
    <Container background={background}>
      <Header
        skin={skin}
        name={player.prefixName}
        badge={badge}
        sidebar={sidebar}
        title={`§l${FormattedGame.BRIDGE} §fStats §r(${mode.formatted})`}
        description={`§7${t("stats.title")}: ${
          bridge.titleFormatted
        }\n${formatProgression({
          t,
          label: t("stats.progression.win"),
          progression: bridge.progression,
          currentLevel: bridge.titleLevelFormatted,
          nextLevel: bridge.nextTitleLevelFormatted,
        })}`}
        time={time}
      />
      <Table.table>
        <Historical.exclude time={time}>
          <Table.tr>
            <Table.td
              title={t("stats.winstreak")}
              value={t(stats.winstreak)}
              color="§e"
            />
            <Table.td
              title={t("stats.bestWinstreak")}
              value={t(stats.bestWinstreak)}
              color="§e"
            />
          </Table.tr>
        </Historical.exclude>
        <Table.tr>
          <Table.td title={t("stats.wins")} value={t(stats.wins)} color="§a" />
          <Table.td title={t("stats.losses")} value={t(stats.losses)} color="§c" />
          <Table.td title={t("stats.wlr")} value={t(stats.wlr)} color="§6" />
        </Table.tr>
        <Table.tr>
          <Table.td title={t("stats.kills")} value={t(stats.kills)} color="§a" />
          <Table.td title={t("stats.deaths")} value={t(stats.deaths)} color="§c" />
          <Table.td title={t("stats.kdr")} value={t(stats.kdr)} color="§6" />
        </Table.tr>
      </Table.table>
      <Footer logo={logo} user={user} />
    </Container>
  );
};
