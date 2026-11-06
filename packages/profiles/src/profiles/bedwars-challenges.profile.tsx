/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { BEDWARS, cardColours } from "@statsify/catalog";
import { Container, Footer, Header, SidebarItem, Table } from "../components/index.js";
import {
  BedWarsModeChallenges,
  type FieldMetadata,
  FormattedGame,
  getLeaderboardFields,
} from "@statsify/schemas";
import { arrayGroup, prettify } from "@statsify/util";
import type { BaseProfileProps } from "../types.js";

const challengeFields = getLeaderboardFields(BedWarsModeChallenges).filter(
  ([field]) => field !== "totalChallenges" && field !== "uniqueChallenges",
) as [
  Exclude<keyof BedWarsModeChallenges, "totalChallenges" | "uniqueChallenges">,
  FieldMetadata,
][];

const rows = arrayGroup(challengeFields, 3);

const colour = cardColours(BEDWARS, "challenges");

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
    ["Total Completions", t(challenges.totalChallenges as number), colour("totalChallenges")],
    ["Unique Completions", t(challenges.uniqueChallenges as number), colour("uniqueChallenges")],
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
                    §l{colour(field, completions)}
                    {metadata.leaderboard.fieldName ?? prettify(field)}
                  </text>
                  <div width="remaining" margin={{ left: 4, right: 4 }} />
                  <text>
                    {colour(field, completions)}
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
