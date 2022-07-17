/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { BaseProfileProps } from "../base.hypixel-command";
import { Container, Footer, Header, SidebarItem, Table } from "#components";
import { FormattedGame, VampireZLife } from "@statsify/schemas";
import { LocalizeFunction } from "@statsify/discord";

interface VampireZColumnProps {
  mode: string;
  stats: VampireZLife;
  t: LocalizeFunction;
}

const VampireZColumn = ({ mode, stats, t }: VampireZColumnProps) => (
  <Table.ts title={mode}>
    <Table.td title={t(`stats.wins`)} value={t(stats.wins)} color="§e" />
    <Table.td title={t(`stats.kills`)} value={t(stats.kills)} color="§a" />
    <Table.td title={t(`stats.deaths`)} value={t(stats.deaths)} color="§c" />
    <Table.td title={t(`stats.kdr`)} value={t(stats.kdr)} color="§6" />
  </Table.ts>
);

export const VampireZProfile = ({
  skin,
  player,
  background,
  logo,
  user,
  badge,
  t,
  time,
}: BaseProfileProps) => {
  const { vampirez } = player.stats;

  const sidebar: SidebarItem[] = [
    [t("stats.coins"), t(vampirez.coins), "§6"],
    [t("stats.tokens"), t(vampirez.tokens), "§e"],
    [t("stats.mostVampireKills"), t(vampirez.mostVampireKills), "§c"],
    [t("stats.zombieKills"), t(vampirez.zombieKills), "§2"],
  ];

  return (
    <Container background={background}>
      <Header
        skin={skin}
        name={player.prefixName}
        badge={badge}
        sidebar={sidebar}
        title={`§l${FormattedGame.VAMPIREZ} §fStats`}
        time={time}
      />
      <Table.table>
        <Table.tr>
          <VampireZColumn mode="§6Overall" stats={vampirez.overall} t={t} />
          <VampireZColumn mode="§eHuman" stats={vampirez.human} t={t} />
          <VampireZColumn mode="§4Vampire" stats={vampirez.vampire} t={t} />
        </Table.tr>
      </Table.table>
      <Footer logo={logo} user={user} />
    </Container>
  );
};
