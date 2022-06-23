/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Container, Footer, Header, Table } from "#components";
import { FormattedGame, LeaderboardScanner, Parkour } from "@statsify/schemas";
import { arrayGroup, formatTime } from "@statsify/util";
import type { BaseProfileProps } from "../base.hypixel-command";

const parkourNames = Object.fromEntries(
  LeaderboardScanner.getLeaderboardMetadata(Parkour).map(([key, m]) => [
    key,
    m.leaderboard.name.replace(" Lobby", ""),
  ]) as [string, string][]
);

export const ParkourProfile = ({
  skin,
  player,
  badge,
  logo,
  tier,
  background,
}: BaseProfileProps) => {
  const { parkour } = player.stats;

  const times = Object.entries(parkour)
    .map(([field, time]) => [parkourNames[field], time])
    .sort((a, b) => (a[1] ?? Number.MAX_VALUE) - (b[1] ?? Number.MAX_VALUE));

  const rows = arrayGroup(times, 4);

  return (
    <Container background={background}>
      <Header
        skin={skin}
        name={player.prefixName}
        badge={badge}
        title={`§l${FormattedGame.PARKOUR} §fTimes`}
        time="LIVE"
      />
      <Table.table>
        {rows.map((row) => (
          <Table.tr>
            {row.map(([name, time]) => (
              <Table.td
                title={`§l${name}`}
                value={time ? formatTime(time) : "N/A"}
                color="§f"
                size="small"
              />
            ))}
          </Table.tr>
        ))}
      </Table.table>
      <Footer logo={logo} tier={tier} />
    </Container>
  );
};
