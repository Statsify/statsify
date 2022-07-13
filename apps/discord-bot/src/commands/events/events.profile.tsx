/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Container, Footer, Header, SidebarItem, Table } from "#components";
import type { BaseProfileProps } from "../base.hypixel-command";

export const EventsProfile = ({
  player,
  skin,
  background,
  logo,
  user,
  badge,
  t,
}: BaseProfileProps) => {
  const events = player.events;

  const sidebar: SidebarItem[] = [[t("stats.silver"), t(events.silver), "§7"]];

  return (
    <Container background={background}>
      <Header
        name={player.prefixName}
        skin={skin}
        badge={badge}
        sidebar={sidebar}
        time="LIVE"
        title="§l§eEvent §fStats"
      />
      <Table.table>
        <Table.ts title="§#ff5555S§#ff7b7bu§#ffa1a1m§#ffc6c6m§#ffecece§#ecffffr §#c6ffff2§#a1ffff0§#7bffff2§#55ffff2">
          <Table.tr>
            <Table.td
              title={t("stats.level")}
              value={t(events.summer.level)}
              color="§b"
            />
            <Table.td title={t("stats.exp")} value={t(events.summer.exp)} color="§b" />
          </Table.tr>
        </Table.ts>
      </Table.table>
      <Footer logo={logo} user={user} />
    </Container>
  );
};
