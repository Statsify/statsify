/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Container, Footer, Header, SidebarItem, Table } from "#components";
import { FormattedGame } from "@statsify/schemas";
import { arrayGroup, prettify } from "@statsify/util";
import type { BaseProfileProps } from "#commands/base.hypixel-command";

export const BedWarsChallengesProfile = ({
  skin,
  player,
  background,
  logo,
  user,
  badge,
  t,
  time,
}: BaseProfileProps) => {
  const { challenges } = player.stats.bedwars;

  const sidebar: SidebarItem[] = [
    ["Total Completions", t(challenges.totalChallenges as number), "§6"],
    ["Unique Completions", t(challenges.uniqueChallenges as number), "§e"],
  ];

  delete challenges.uniqueChallenges;
  delete challenges.totalChallenges;
  const rows = arrayGroup(Object.entries(challenges), 4);

  return (
    <Container background={background}>
      <Header
        skin={skin}
        name={player.prefixName}
        badge={badge}
        sidebar={sidebar}
        title={`§l${FormattedGame.BEDWARS} §fChallenges`}
        time={time}
      />
      <Table.table>
        {rows.map((row) => (
          <Table.tr>
            {row.map((challenge) => (
              // Hypixel doesn't localize the challenge names, so we dont't need to localize them
              <Table.td
                title={prettify(challenge[0]).replace("Ultimate U H C", "Ultimate UHC")}
                value={t(challenge[1])}
                color={challenge[1] > 0 ? "§a" : "§c"}
              />
            ))}
          </Table.tr>
        ))}
      </Table.table>
      <Footer logo={logo} user={user} />
    </Container>
  );
};
