/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Container, Footer, Header, Table } from "#components";
import { FormattedGame } from "@statsify/schemas";
import { arrayGroup, prettify } from "@statsify/util";
import type { BaseProfileProps } from "#commands/base.hypixel-command";

export const SkyWarsChallengesProfile = ({
  skin,
  player,
  background,
  logo,
  user,
  badge,
  t,
  time,
}: BaseProfileProps) => {
  const { challenges } = player.stats.skywars;
  const rows = arrayGroup(Object.entries(challenges), 3);

  return (
    <Container background={background}>
      <Header
        skin={skin}
        name={player.prefixName}
        badge={badge}
        title={`§l${FormattedGame.SKYWARS} §fChallenges`}
        time={time}
      />
      <Table.table>
        {rows.map((row) => (
          <Table.tr>
            {row.map(([name, wins]) => (
              <box width="100%" padding={{ left: 8, right: 8, top: 4, bottom: 4 }}>
                <text>§l{wins > 0 ? "§a" : "§c"}{prettify(name).replace("Uhc", "UHC")}</text>
                <div width="remaining" margin={{ left: 4, right: 4 }} />
                <text>{wins > 0 ? "§a" : "§c"}{t(wins)}</text>
              </box>
            ))}
          </Table.tr>
        ))}
      </Table.table>
      <Footer logo={logo} user={user} />
    </Container>
  );
};
