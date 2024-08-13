/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { LocalizeFunction } from "@statsify/discord";
import { PartyGames } from "@statsify/schemas";
import { Table } from "#components";
import { formatRaceTime } from "@statsify/util";

interface PartyGamesTableProps {
  stats: PartyGames;
  t: LocalizeFunction;
}

export const PartyGamesTable = ({ stats, t }: PartyGamesTableProps) => (
  <Table.table>
    <Table.tr>
      <Table.td title={t("stats.wins")} value={t(stats.wins)} color="§a" />
      <Table.td title={t("stats.roundWins")} value={t(stats.roundsWon)} color="§e" />
      <Table.td title={t("stats.starsEarned")} value={t(stats.starsEarned)} color="§6" />
    </Table.tr>
    <Table.ts title="Best Times">
      <Table.tr>
        <Table.td title="Anvil Spleef" value={stats.anvilSpleefBestTime === 0 ? "§7N/A" : formatRaceTime(stats.anvilSpleefBestTime)} color="§a" size="inline" />
        <Table.td title="Lab Escape" value={stats.labEscapeBestTime === 0 ? "§7N/A" : formatRaceTime(stats.labEscapeBestTime)} color="§a" size="inline" />
        <Table.td title="Jigsaw Rush" value={stats.jigsawRushBestTime === 0 ? "§7N/A" : formatRaceTime(stats.jigsawRushBestTime)} color="§a" size="inline" />
      </Table.tr>
      <Table.tr>
        <Table.td title="The Floor Is Lava" value={stats.theFloorIsLavaBestTime === 0 ? "§7N/A" : formatRaceTime(stats.theFloorIsLavaBestTime)} color="§a" size="inline" />
        <Table.td title="Chicken Rings" value={stats.chickenRingsBestTime === 0 ? "§7N/A" : formatRaceTime(stats.chickenRingsBestTime)} color="§a" size="inline" />
        <Table.td title="Jungle Jump" value={stats.jungleJumpBestTime === 0 ? "§7N/A" : formatRaceTime(stats.jungleJumpBestTime)} color="§a" size="inline" />
      </Table.tr>
      <Table.tr>
        <Table.td title="Bombardment" value={stats.bombardmentBestTime === 0 ? "§7N/A" : formatRaceTime(stats.bombardmentBestTime)} color="§a" size="inline" />
        <Table.td title="Minecart Racing" value={stats.minecartRacingBestTime === 0 ? "§7N/A" : formatRaceTime(stats.minecartRacingBestTime)} color="§a" size="inline" />
        <Table.td title="Spider Maze" value={stats.spiderMazeBestTime === 0 ? "§7N/A" : formatRaceTime(stats.spiderMazeBestTime)} color="§a" size="inline" />
      </Table.tr>
    </Table.ts>
    <Table.ts title="Best Scores">
      <Table.tr>
        <Table.td title="Animal Slaughter" value={t(stats.animalSlaughterBestScore)} color="§a" size="inline" />
        <Table.td title="Dive" value={t(stats.diveBestScore)} color="§a" size="inline" />
        <Table.td title="High Ground" value={t(stats.highGroundBestScore)} color="§a" size="inline" />
      </Table.tr>
      <Table.tr>
        <Table.td title="Hoe Hoe Hoe" value={t(stats.hoeHoeHoeBestScore)} color="§a" size="inline" />
        <Table.td title="Lawn Moower" value={t(stats.lawnMoowerBestScore)} color="§a" size="inline" />
        <Table.td title="RPG-16" value={t(stats.rpg16BestScore)} color="§a" size="inline" />
      </Table.tr>
    </Table.ts>
  </Table.table>
);

