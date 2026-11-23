/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { BLITZSG, cardColors } from "@statsify/catalog";
import {
  BlitzSG,
  BlitzSGKit,
  BlitzSGModes,
  FormattedGame,
  type GameMode,
} from "@statsify/schemas";
import {
  Container,
  Footer,
  Header,
  SidebarItem,
  Table,
  formatProgression,
} from "../components/index.js";
import { formatTime, prettify, romanNumeral } from "@statsify/util";
import type { BaseProfileProps, LocalizeFunction } from "../types.js";

const color = cardColors(BLITZSG);

interface OverallBlitzSGTableProps {
  blitzsg: BlitzSG;
  t: LocalizeFunction;
}

const OverallBlitzSGTable = ({ blitzsg, t }: OverallBlitzSGTableProps) => (
  <Table.table>
    <Table.ts title="§6Overall">
      <Table.tr>
        <Table.td
          title={t("stats.wins")}
          value={t(blitzsg.overall.wins)}
          color={color("overall.wins")}
        />
        <Table.td
          title={t("stats.kills")}
          value={t(blitzsg.overall.kills)}
          color={color("overall.kills")}
        />
        <Table.td
          title={t("stats.deaths")}
          value={t(blitzsg.overall.deaths)}
          color={color("overall.deaths")}
        />
        <Table.td
          title={t("stats.kdr")}
          value={t(blitzsg.overall.kdr)}
          color={color("overall.kdr")}
        />
      </Table.tr>
    </Table.ts>
    <Table.tr>
      <Table.ts title="§6Solo">
        <Table.tr>
          <Table.td
            title={t("stats.wins")}
            value={t(blitzsg.solo.wins)}
            color={color("solo.wins")}
            size="small"
          />
          <Table.td
            title={t("stats.kills")}
            value={t(blitzsg.solo.kills)}
            color={color("solo.kills")}
            size="small"
          />
        </Table.tr>
      </Table.ts>
      <Table.ts title="§6Doubles">
        <Table.tr>
          <Table.td
            title={t("stats.wins")}
            value={t(blitzsg.doubles.wins)}
            color={color("doubles.wins")}
            size="small"
          />
          <Table.td
            title={t("stats.kills")}
            value={t(blitzsg.doubles.kills)}
            color={color("doubles.kills")}
            size="small"
          />
        </Table.tr>
      </Table.ts>
    </Table.tr>
  </Table.table>
);

interface KitBlitzSGTableProps {
  stats: BlitzSGKit;
  /** The kit's colors, from its mode. */
  color: ReturnType<typeof cardColors>;
  t: LocalizeFunction;
}

const KitBlitzSGTable = ({ stats, color, t }: KitBlitzSGTableProps) => {
  return (
    <Table.table>
      <Table.tr>
        <Table.td title={t("stats.wins")} value={t(stats.wins)} color={color("wins")} />
        <Table.td title={t("stats.losses")} value={t(stats.losses)} color={color("losses")} />
        <Table.td title={t("stats.wlr")} value={t(stats.wlr)} color={color("wlr")} />
      </Table.tr>
      <Table.tr>
        <Table.td title={t("stats.kills")} value={t(stats.kills)} color={color("kills")} />
        <Table.td title={t("stats.deaths")} value={t(stats.deaths)} color={color("deaths")} />
        <Table.td title={t("stats.kdr")} value={t(stats.kdr)} color={color("kdr")} />
      </Table.tr>
      <Table.tr>
        <Table.td
          title={t("stats.playtime")}
          value={formatTime(stats.playtime)}
          color={color("playtime")}
        />
        <Table.td
          title={t("stats.gamesPlayed")}
          value={t(stats.gamesPlayed)}
          color={color("gamesPlayed")}
        />
      </Table.tr>
    </Table.table>
  );
};

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

  const sidebar: SidebarItem[] = [[t("stats.coins"), t(blitzsg.coins), color("coins")]];

  let table: JSX.Element;

  switch (mode.api) {
    case "overall":
      table = <OverallBlitzSGTable blitzsg={blitzsg} t={t} />;

      sidebar.push([t("stats.kit"), prettify(blitzsg.kit), color("kit")]);
      break;

    default: {
      const stats = blitzsg[mode.api];
      const kitColor = cardColors(BLITZSG, mode.api);

      if (stats.level) {
        let level = romanNumeral(stats.level);

        if (stats.prestige) level = `§6${"✫".repeat(stats.prestige)}`;

        if (stats.level === 10) level = `§l${level}`;

        sidebar.push(
          [t("stats.level"), level, kitColor("level", stats.level, stats)],
          [t("stats.exp"), t(stats.exp), kitColor("exp")]
        );
      }

      table = <KitBlitzSGTable stats={stats} color={kitColor} t={t} />;
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
        description={
          mode.api === "overall" ?
            `§7${t("stats.prefix")}: ${blitzsg.naturalPrefix}\n${formatProgression(
              {
                t,
                label: t("stats.progression.kill"),
                progression: blitzsg.progression,
                currentLevel: blitzsg.currentPrefix,
                nextLevel: blitzsg.nextPrefix,
              }
            )}` :
            ""
        }
        time={time}
      />
      {table}
      <Footer logo={logo} user={user} />
    </Container>
  );
};
