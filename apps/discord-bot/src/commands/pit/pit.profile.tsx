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
import { FormattedGame, Progression } from "@statsify/schemas";
import { formatTime } from "@statsify/util";
import { ratio } from "@statsify/math";
import type { BaseProfileProps } from "../base.hypixel-command";
import type { PitPandaPlayer } from "#services";

export interface PitProfileProps extends Omit<BaseProfileProps, "player" | "time"> {
  player: PitPandaPlayer;
}

export const PitProfile = ({
  background,
  logo,
  skin,
  t,
  badge,
  tier,
  player,
}: PitProfileProps) => {
  const sidebar: SidebarItem[] = [
    [t("stats.gold"), `${t(player.gold)}g`, "§6"],
    [t("stats.exp"), t(player.xp), "§b"],
  ];

  if (player.doc.renown) sidebar.push([t("stats.renown"), `${player.doc.renown}`, "§b"]);
  if (player.doc.bounty) sidebar.push([t("stats.bounty"), `${player.doc.bounty}`, "§6"]);

  return (
    <Container background={background}>
      <Header
        name={player.doc.colouredName}
        skin={skin}
        time="LIVE"
        title="§l§eThe §aPit §fStats"
        description={`${FormattedGame.PIT} §7Level: ${
          player.doc.formattedLevel
        }\n${formatProgression(
          t,
          new Progression(
            player.xpProgress.displayCurrent,
            player.xpProgress.displayGoal
          ),
          player.doc.formattedLevel,
          player.doc.formattedLevel,
          true,
          false
        )}`}
        sidebar={sidebar}
        badge={badge}
      />
      <Table.table>
        <Table.tr>
          <Table.td title={t("stats.kills")} value={t(player.kills)} color="§a" />
          <Table.td title={t("stats.deaths")} value={t(player.deaths)} color="§c" />
          <Table.td title={t("stats.kdr")} value={t(player.kdr)} color="§6" />
          <Table.td title={t("stats.assists")} value={t(player.doc.assists)} color="§e" />
        </Table.tr>
        <Table.tr>
          <Table.td
            title={t("stats.highestStreak")}
            value={t(player.doc.highestStreak)}
            color="§c"
          />
          <Table.td
            title={t("stats.playtime")}
            value={formatTime(player.doc.playtime * 60_000)}
            color="§b"
          />
        </Table.tr>
      </Table.table>
      <Footer logo={logo} tier={tier} />
    </Container>
  );
};
