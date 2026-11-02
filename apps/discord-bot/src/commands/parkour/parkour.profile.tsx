/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Container, Footer, GameList, Header } from "#components";
import { FormattedGame, GameId, Parkour, scanMetadata } from "@statsify/schemas";
import { formatTime } from "@statsify/util";
import type { BaseProfileProps } from "#commands/base.hypixel-command";
import type { Image } from "skia-canvas";

interface ParkourProfileProps extends BaseProfileProps {
  gameIcons: Record<GameId, Image>;
}

// The API leaves out lobbies without a run, so list every lobby from the schema
const LOBBIES = scanMetadata(Parkour).map(([lobby]) => lobby as keyof Parkour);

export const ParkourProfile = ({
  skin,
  player,
  badge,
  logo,
  user,
  background,
  gameIcons,
}: ParkourProfileProps) => {
  const { parkour } = player.stats;

  const times: [GameId, any][] = LOBBIES
    .map((lobby) => [lobby, parkour[lobby]] as const)
    .sort((a, b) => (a[1] ?? Number.MAX_VALUE) - (b[1] ?? Number.MAX_VALUE))
    .map(([lobby, time]) => [lobby, time === undefined ? "N/A" : formatTime(time)]);

  return (
    <Container background={background}>
      <Header
        skin={skin}
        name={player.prefixName}
        badge={badge}
        title={`§l${FormattedGame.PARKOUR} §fTimes`}
        time="LIVE"
      />
      <GameList entries={times} gameIcons={gameIcons} />
      <Footer logo={logo} user={user} />
    </Container>
  );
};
