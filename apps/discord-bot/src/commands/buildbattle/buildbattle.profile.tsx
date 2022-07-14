/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Container, Footer, Header, SidebarItem, Table } from "#components";
import { FormattedGame } from "@statsify/schemas";
import type { BaseProfileProps, ProfileTime } from "../base.hypixel-command";

interface BuildBattleModeTableProps {
  title: string;
  stats: [string, string][];
  time: ProfileTime;
}

const BuildBattleModeTable = ({ title, stats, time }: BuildBattleModeTableProps) => {
  const colors = ["§a", "§6"];

  if (time !== "LIVE") stats.splice(1, 2);

  return (
    <Table.table width="remaining">
      <Table.ts title={`§e${title}`}>
        {stats.map(([title, value], index) => (
          <Table.tr>
            <Table.td title={title} value={value} color={colors[index]} />
          </Table.tr>
        ))}
      </Table.ts>
    </Table.table>
  );
};

export const BuildBattleProfile = ({
  player,
  background,
  logo,
  skin,
  t,
  badge,
  user,
  time,
}: BaseProfileProps) => {
  const { buildbattle } = player.stats;

  const sidebar: SidebarItem[] = [
    [t("stats.coins"), t(buildbattle.coins), "§6"],
    [t("stats.score"), t(buildbattle.score), "§a"],
    [t("stats.votes"), t(buildbattle.votes), "§c"],
    [t("stats.superVotes"), t(buildbattle.superVotes), "§b"],
  ];

  return (
    <Container background={background}>
      <Header
        skin={skin}
        name={player.prefixName}
        badge={badge}
        sidebar={sidebar}
        title={`§l${FormattedGame.BUILD_BATTLE} §fStats`}
        description={`§dBuild Battle Title\n${buildbattle.titleFormatted}`}
        time={time}
      />
      <div width="100%">
        <BuildBattleModeTable
          time={time}
          title="Overall"
          stats={[[t("stats.wins"), t(buildbattle.overall.wins)]]}
        />
        <BuildBattleModeTable
          time={time}
          title="Pro"
          stats={[[t("stats.wins"), t(buildbattle.pro.wins)]]}
        />
        <BuildBattleModeTable
          time={time}
          title="1.14"
          stats={[[t("stats.wins"), t(buildbattle.latestWins)]]}
        />
      </div>
      <div width="100%">
        <BuildBattleModeTable
          time={time}
          title="Solo"
          stats={[
            [t("stats.wins"), t(buildbattle.solo.wins)],
            [t("stats.maxPoints"), t(buildbattle.solo.maxPoints)],
          ]}
        />
        <BuildBattleModeTable
          time={time}
          title="Teams"
          stats={[
            [t("stats.wins"), t(buildbattle.teams.wins)],
            [t("stats.maxPoints"), t(buildbattle.teams.maxPoints)],
          ]}
        />
        <BuildBattleModeTable
          time={time}
          title="GTB"
          stats={[
            [t("stats.wins"), t(buildbattle.guessTheBuild.wins)],
            [t("stats.correctGuesses"), t(buildbattle.guessTheBuild.correctGuesses)],
          ]}
        />
      </div>
      <Footer logo={logo} user={user} />
    </Container>
  );
};
