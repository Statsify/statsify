/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Container, Footer, Header, SidebarItem, Table } from "#components";
import {
  BedWarsModeChallenges,
  type FieldMetadata,
  FormattedGame,
  getLeaderboardFields,
} from "@statsify/schemas";
import { arrayGroup, prettify } from "@statsify/util";
import type { BaseProfileProps } from "#commands/base.hypixel-command";

const challengeFields = getLeaderboardFields(BedWarsModeChallenges).filter(
  ([field]) => field !== "totalChallenges" && field !== "uniqueChallenges",
) as [
  Exclude<keyof BedWarsModeChallenges, "totalChallenges" | "uniqueChallenges">,
  FieldMetadata,
][];

const rows = arrayGroup(challengeFields, 3);

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
            {row.map(([field, metadata]) => {
              const completions = challenges[field];

              return (
                <box
                  width="100%"
                  padding={{ left: 8, right: 8, top: 4, bottom: 4 }}
                >
                  <text>
                    §l{completions > 0 ? "§a" : "§c"}
                    {metadata.leaderboard.fieldName ?? prettify(field)}
                  </text>
                  <div width="remaining" margin={{ left: 4, right: 4 }} />
                  <text>
                    {completions > 0 ? "§a" : "§c"}
                    {t(completions)}
                  </text>
                </box>
              );
            })}
          </Table.tr>
        ))}
      </Table.table>
      <Footer logo={logo} user={user} />
    </Container>
  );
};
