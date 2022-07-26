/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  Container,
  Footer,
  Header,
  SidebarItem,
  Table,
  formatProgression,
} from "#components";
import { FormattedGame } from "@statsify/schemas";
import { formatTime } from "@statsify/util";
import type { BaseProfileProps } from "../base.hypixel-command";

export type PitProfileProps = BaseProfileProps;

export const PitProfile = ({
  background,
  logo,
  skin,
  t,
  badge,
  user,
  player,
}: PitProfileProps) => {
  const { pit } = player.stats;

  const sidebar: SidebarItem[] = [
    [t("stats.gold"), `${t(pit.gold)}g`, "§6"],
    [t("stats.exp"), t(pit.exp), "§b"],
  ];

  if (pit.renown) sidebar.push([t("stats.renown"), `${pit.renown}`, "§b"]);
  if (pit.bounty) sidebar.push([t("stats.bounty"), `${pit.bounty}`, "§6"]);

  return (
    <Container background={background}>
      <Header
        name={player.prefixName}
        skin={skin}
        time="LIVE"
        title={`§l${FormattedGame.PIT} §fStats`}
        description={`§7Level: ${pit.prefix}\n§7EXP ${formatProgression({
          t,
          progression: pit.progression,
          currentLevel: pit.prefix,
          nextLevel: "",
          showLevel: false,
        })}`}
        sidebar={sidebar}
        badge={badge}
      />
      <Table.table>
        <Table.tr>
          <Table.td title={t("stats.kills")} value={t(pit.kills)} color="§a" />
          <Table.td title={t("stats.deaths")} value={t(pit.deaths)} color="§c" />
          <Table.td title={t("stats.kdr")} value={t(pit.kdr)} color="§6" />
        </Table.tr>
        <Table.tr>
          <Table.td
            title={t("stats.highestStreak")}
            value={t(pit.highestStreak)}
            color="§d"
          />
          <Table.td
            title={t("stats.playtime")}
            value={formatTime(pit.playtime)}
            color="§b"
          />
          <Table.td title={t("stats.assists")} value={t(pit.assists ?? 0)} color="§e" />
        </Table.tr>
      </Table.table>
      <Footer logo={logo} user={user} />
    </Container>
  );
};
