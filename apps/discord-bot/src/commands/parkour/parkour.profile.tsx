/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Container, Footer, Header, Table } from "#components";
import { FormattedGame, GameId, Parkour } from "@statsify/schemas";
import { arrayGroup, formatTime } from "@statsify/util";
import type { BaseProfileProps } from "../base.hypixel-command";
import type { Image } from "skia-canvas";

interface ParkourProfileProps extends BaseProfileProps {
  gameIcons: Record<GameId, Image>;
}

export const ParkourProfile = ({
  skin,
  player,
  badge,
  logo,
  tier,
  background,
  gameIcons,
}: ParkourProfileProps) => {
  const { parkour } = player.stats;

  const ROW_SIZE = 2;

  const times = Object.entries(parkour)
    .sort((a, b) => (a[1] ?? Number.MAX_VALUE) - (b[1] ?? Number.MAX_VALUE))
    .map(([field, time]) => (
      <box width="100%" padding={{ left: 8, right: 8, top: 4, bottom: 4 }}>
        <img image={gameIcons[field as keyof Parkour]} width={32} height={32} />
        <text>§l{FormattedGame[field as keyof Parkour]}</text>
        <div width="remaining" margin={{ left: 4, right: 4 }} />
        <text>{time ? formatTime(time) : "N/A"}</text>
      </box>
    ));

  const groups = arrayGroup(times, ROW_SIZE);

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
        {groups.map((group) => (
          <Table.tr>{group}</Table.tr>
        ))}
      </Table.table>
      <Footer logo={logo} tier={tier} />
    </Container>
  );
};
