/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Container, Footer, Header, Table } from "#components";
import { FormattedGame, type GameMode, type PartyGamesModes } from "@statsify/schemas";
import { PartyGamesTable } from "./modes/index.js";
import type { BaseProfileProps } from "#commands/base.hypixel-command";

export interface PartyGamesProfileProps extends BaseProfileProps {
  mode: GameMode<PartyGamesModes>;
}

export const PartyGamesProfile = ({
  skin,
  player,
  background,
  logo,
  user,
  badge,
  mode,
  t,
  time,
}: PartyGamesProfileProps) => {
  const { arcade } = player.stats;
  const { partyGames } = arcade;

  let table;

  switch (mode.api) {
    case "overall":
      table = <PartyGamesTable stats={arcade.partyGames} t={t} />;
      break;
    case "roundWins":
      table = (
        <Table.table>
          <Table.tr>
            <Table.td title="Animal Slaughter" value={t(partyGames.animalSlaughterWins)} size="inline" color="§a" />
            <Table.td title="Anvil Spleef" value={t(partyGames.anvilSpleefWins)} size="inline" color="§a" />
            <Table.td title="Avalanche" value={t(partyGames.avalancheWins)} size="inline" color="§a" />
          </Table.tr>
          <Table.tr>
            <Table.td title="Bombardment" value={t(partyGames.bombardmentWins)} size="inline" color="§a" />
            <Table.td title="Cannon Painting" value={t(partyGames.cannonPaintingWins)} size="inline" color="§a" />
            <Table.td title="Chicken Rings" value={t(partyGames.chickenRingsWins)} size="inline" color="§a" />
          </Table.tr>
          <Table.tr>
            <Table.td title="Dive" value={t(partyGames.diveWins)} size="inline" color="§a" />
            <Table.td title="Fire Leapers" value={t(partyGames.fireLeapersWins)} size="inline" color="§a" />
            <Table.td title="Frozen Floor" value={t(partyGames.frozenFloorWins)} size="inline" color="§a" />
          </Table.tr>
          <Table.tr>
            <Table.td title="High Ground" value={t(partyGames.highGroundWins)} size="inline" color="§a" />
            <Table.td title="Hoe Hoe Hoe" value={t(partyGames.hoeHoeHoeWins)} size="inline" color="§a" />
            <Table.td title="Jigsaw Rush" value={t(partyGames.jigsawRushWins)} size="inline" color="§a" />
          </Table.tr>
          <Table.tr>
            <Table.td title="Jungle Jump" value={t(partyGames.jungleJumpWins)} size="inline" color="§a" />
            <Table.td title="Lab Escape" value={t(partyGames.labEscapeWins)} size="inline" color="§a" />
            <Table.td title="Lawn Moower" value={t(partyGames.lawnMoowerWins)} size="inline" color="§a" />
          </Table.tr>
          <Table.tr>
            <Table.td title="Minecart Racing" value={t(partyGames.minecartRacingWins)} size="inline" color="§a" />
            <Table.td title="Pig Fishing" value={t(partyGames.pigFishingWins)} size="inline" color="§a" />
            <Table.td title="Pig Jousting" value={t(partyGames.pigJoustingWins)} size="inline" color="§a" />
          </Table.tr>
          <Table.tr>
            <Table.td title="RPG-16" value={t(partyGames.rpg16Wins)} size="inline" color="§a" />
            <Table.td title="Shooting Range" value={t(partyGames.shootingRangeWins)} size="inline" color="§a" />
            <Table.td title="Spider Maze" value={t(partyGames.spiderMazeWins)} size="inline" color="§a" />
          </Table.tr>
          <Table.tr>
            <Table.td title="Super Sheep" value={t(partyGames.superSheepWins)} size="inline" color="§a" />
            <Table.td title="The Floor Is Lava" value={t(partyGames.theFloorIsLavaWins)} size="inline" color="§a" />
            <Table.td title="Trampolinio" value={t(partyGames.trampolinioWins)} size="inline" color="§a" />
          </Table.tr>
          <Table.tr>
            <Table.td title="Volcano" value={t(partyGames.volcanoWins)} size="inline" color="§a" />
            <Table.td title="Workshop" value={t(partyGames.workshopWins)} size="inline" color="§a" />
          </Table.tr>
        </Table.table>
      );
      break;
  }

  return (
    <Container background={background}>
      <Header
        skin={skin}
        name={player.prefixName}
        badge={badge}
        title={`§l${FormattedGame.PARTY_GAMES} §fStats §r(${mode.formatted})`}
        time={time}
      />
      {table}
      <Footer logo={logo} user={user} />
    </Container>
  );
};
