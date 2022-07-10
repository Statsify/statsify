/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { BaseProfileProps } from "../base.hypixel-command";
import {
  BlitzSG,
  BlitzSGKit,
  BlitzSGModes,
  FormattedGame,
  GameMode,
} from "@statsify/schemas";
import { Container, Footer, Header, SidebarItem, Table } from "#components";
import { LocalizeFunction } from "@statsify/discord";
import { formatTime, prettify, romanNumeral } from "@statsify/util";

interface OverallBlitzSGTableProps {
  blitzsg: BlitzSG;
  t: LocalizeFunction;
}

const OverallBlitzSGTable = ({ blitzsg, t }: OverallBlitzSGTableProps) => (
  <Table.table>
    <Table.ts title="§6Overall">
      <Table.tr>
        <Table.td title={t("stats.wins")} value={t(blitzsg.overall.wins)} color="§e" />
        <Table.td title={t("stats.kills")} value={t(blitzsg.overall.kills)} color="§a" />
        <Table.td
          title={t("stats.deaths")}
          value={t(blitzsg.overall.deaths)}
          color="§c"
        />
        <Table.td title={t("stats.kdr")} value={t(blitzsg.overall.kdr)} color="§6" />
      </Table.tr>
    </Table.ts>
    <Table.tr>
      <Table.ts title="§6Solo">
        <Table.tr>
          <Table.td
            title={t("stats.wins")}
            value={t(blitzsg.solo.wins)}
            color="§e"
            size="small"
          />
          <Table.td
            title={t("stats.kills")}
            value={t(blitzsg.solo.kills)}
            color="§a"
            size="small"
          />
        </Table.tr>
      </Table.ts>
      <Table.ts title="§6Doubles">
        <Table.tr>
          <Table.td
            title={t("stats.wins")}
            value={t(blitzsg.doubles.wins)}
            color="§e"
            size="small"
          />
          <Table.td
            title={t("stats.kills")}
            value={t(blitzsg.doubles.kills)}
            color="§a"
            size="small"
          />
        </Table.tr>
      </Table.ts>
    </Table.tr>
  </Table.table>
);

interface KitBlitzSGTableProps {
  stats: BlitzSGKit;
  t: LocalizeFunction;
}

const KitBlitzSGTable = ({ stats, t }: KitBlitzSGTableProps) => (
  <Table.table>
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
    <Table.tr>
      <Table.td
        title={t("stats.playtime")}
        value={formatTime(stats.playtime)}
        color="§e"
      />
      <Table.td title={t("stats.gamesPlayed")} value={t(stats.gamesPlayed)} color="§b" />
    </Table.tr>
  </Table.table>
);

export interface BlitzSGProfileProps extends BaseProfileProps {
  mode: GameMode<BlitzSGModes>;
}

export const BlitzSGProfile = ({
  skin,
  player,
  background,
  logo,
  user,
  badge,
  mode,
  t,
  time,
}: BlitzSGProfileProps) => {
  const { blitzsg } = player.stats;

  const sidebar: SidebarItem[] = [[t("stats.coins"), t(blitzsg.coins), "§6"]];

  let table: JSX.Element;

  switch (mode.api) {
    case "overall":
      table = <OverallBlitzSGTable blitzsg={blitzsg} t={t} />;

      sidebar.push([t("stats.kit"), prettify(blitzsg.kit), "§e"]);
      break;
    default: {
      const colors = ["§a", "§a", "§2", "§2", "§e", "§e", "§6", "§6", "§c", "§4"];
      const stats = blitzsg[mode.api];

      let level = stats.prestige
        ? `§6${"✫".repeat(stats.prestige)}`
        : romanNumeral(stats.level);

      if (stats.level === 10) level = `§l${level}`;
      sidebar.push([t("stats.level"), level, colors[stats.level - 1]]);
      sidebar.push([t("stats.exp"), t(stats.exp), "§b"]);
      table = <KitBlitzSGTable stats={stats} t={t} />;
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
        title={`§l${FormattedGame.BLITZSG} §fStats §r(${mode.formatted})`}
        time={time}
      />
      {table}
      <Footer logo={logo} user={user} />
    </Container>
  );
};
