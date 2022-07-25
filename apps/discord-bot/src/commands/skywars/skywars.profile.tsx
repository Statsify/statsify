/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { BaseProfileProps } from "../base.hypixel-command";
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
  SkyWarsLabs,
  SkyWarsMode,
  SkyWarsModes,
} from "@statsify/schemas";
import { LocalizeFunction } from "@statsify/discord";
import { formatTime, prettify } from "@statsify/util";

interface SkyWarsOverallTableProps {
  t: LocalizeFunction;
  stats: SkyWarsMode;
}

const SkyWarsOverallTable = ({ t, stats }: SkyWarsOverallTableProps) => (
  <>
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
      <Table.td title={t("stats.assists")} value={t(stats.assists)} color="§a" />
      <Table.td
        title={t("stats.playtime")}
        value={formatTime(stats.playtime)}
        color="§c"
      />
      <Table.td title={t("stats.kit")} value={prettify(stats.kit)} color="§6" />
    </Table.tr>
  </>
);

interface SkyWarsLabsTableProps {
  t: LocalizeFunction;
  stats: SkyWarsLabs;
}

const SkyWarsLabsTable = ({ t, stats }: SkyWarsLabsTableProps) => {
  const modes = ["lucky", "rush", "slime", "tntMadness"] as const;
  const colors = ["§e", "§b", "§a", "§c"] as const;

  return (
    <>
      <Table.tr>
        {modes.map((mode, index) => {
          const color = colors[index];

          return (
            <Table.ts title={`§6${prettify(mode).replace("Tnt Madness", "TNT Madness")}`}>
              <Table.td
                title={t(`stats.overallWins`)}
                value={t(stats[mode].overall.wins)}
                color={color}
              />
              <Table.td
                title={t(`stats.soloWins`)}
                value={t(stats[mode].solo.wins)}
                color={color}
              />
              <Table.td
                title={t(`stats.doublesWins`)}
                value={t(stats[mode].doubles.wins)}
                color={color}
              />
            </Table.ts>
          );
        })}
      </Table.tr>
    </>
  );
};

export interface SkyWarsProfileProps extends BaseProfileProps {
  mode: GameMode<SkyWarsModes>;
}

export const SkyWarsProfile = ({
  skin,
  player,
  background,
  logo,
  user,
  badge,
  mode,
  t,
  time,
}: SkyWarsProfileProps) => {
  const { skywars } = player.stats;

  const sidebar: SidebarItem[] = [
    [t("stats.coins"), t(skywars.coins), "§6"],
    [t("stats.lootChests"), t(skywars.lootChests), "§e"],
    [t("stats.tokens"), t(skywars.tokens), "§2"],
    [t("stats.souls"), t(skywars.souls), "§b"],
    [t("stats.heads"), t(skywars.heads), "§d"],
    [t("stats.shards"), t(skywars.shards), "§3"],
    [t("stats.opals"), t(skywars.opals), "§9"],
  ];

  let table: JSX.Element;

  switch (mode.api) {
    case "labs":
      table = <SkyWarsLabsTable t={t} stats={skywars[mode.api]} />;
      break;
    default:
      table = <SkyWarsOverallTable t={t} stats={skywars[mode.api]} />;
      break;
  }

  return (
    <Container background={background}>
      <Header
        skin={skin}
        name={player.prefixName}
        badge={badge}
        sidebar={sidebar}
        title={`§l${FormattedGame.SKYWARS} Stats §r(${mode.formatted})`}
        description={`§7Level: ${skywars.levelFormatted}\n§7EXP ${formatProgression({
          t,
          progression: skywars.progression,
          currentLevel: skywars.levelFormatted,
          nextLevel: skywars.nextLevelFormatted,
        })}`}
        time={time}
      />
      <Table.table>
        {table}
        <Historical.progression
          time={time}
          progression={skywars.progression}
          current={skywars.levelFormatted}
          next={skywars.nextLevelFormatted}
          t={t}
          level={skywars.level}
          exp={skywars.exp}
        />
      </Table.table>
      <Footer logo={logo} user={user} />
    </Container>
  );
};
