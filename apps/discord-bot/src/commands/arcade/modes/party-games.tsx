/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Historical, Table } from "#components";
import { ProfileTime } from "#commands/base.hypixel-command";
import { formatBestTime } from "#lib/format-best-time";
import type { ArcadeModes, PartyGames, SubModeForMode } from "@statsify/schemas";
import type { LocalizeFunction } from "@statsify/discord";

interface PartyGamesTableProps {
  stats: PartyGames;
  submode: SubModeForMode<ArcadeModes, "partyGames">;
  t: LocalizeFunction;
  time: ProfileTime;
}

export const PartyGamesTable = ({ stats, t, submode, time }: PartyGamesTableProps) => (
  <Table.table>
    {submode.api === "overall" ? <PartyGamesOverallTable stats={stats} t={t} time={time} /> : <PartyGamesWinsTable stats={stats} t={t} time={time} />}
  </Table.table>
);

type PartyGamesSubModeTableProps = Omit<PartyGamesTableProps, "submode">;

const PartyGamesOverallTable = ({ stats, t, time }: PartyGamesSubModeTableProps) => (
  <>
    <Table.tr>
      <Table.td title={t("stats.wins")} value={t(stats.wins)} color="§a" />
      <Table.td title={t("stats.roundWins")} value={t(stats.roundsWon)} color="§e" />
      <Table.td title={t("stats.starsEarned")} value={t(stats.starsEarned)} color="§6" />
    </Table.tr>
    <Historical.include time={time}>
      <Table.ts title={t("stats.roundWins")}>
        <PartyGamesWinsTable stats={stats} t={t} time={time} />
      </Table.ts>
    </Historical.include>
    <Historical.exclude time={time}>
      <Table.ts title="Best Times">
        <Table.tr>
          <Table.td title="Anvil Spleef" value={formatBestTime(t, stats.anvilSpleefBestTime)} color="§a" size="inline" />
          <Table.td title="Lab Escape" value={formatBestTime(t, stats.labEscapeBestTime)} color="§a" size="inline" />
          <Table.td title="Jigsaw Rush" value={formatBestTime(t, stats.jigsawRushBestTime)} color="§a" size="inline" />
        </Table.tr>
        <Table.tr>
          <Table.td title="The Floor Is Lava" value={formatBestTime(t, stats.theFloorIsLavaBestTime)} color="§a" size="inline" />
          <Table.td title="Chicken Rings" value={formatBestTime(t, stats.chickenRingsBestTime)} color="§a" size="inline" />
          <Table.td title="Jungle Jump" value={formatBestTime(t, stats.jungleJumpBestTime)} color="§a" size="inline" />
        </Table.tr>
        <Table.tr>
          <Table.td title="Bombardment" value={formatBestTime(t, stats.bombardmentBestTime)} color="§a" size="inline" />
          <Table.td title="Minecart Racing" value={formatBestTime(t, stats.minecartRacingBestTime)} color="§a" size="inline" />
          <Table.td title="Spider Maze" value={formatBestTime(t, stats.spiderMazeBestTime)} color="§a" size="inline" />
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
    </Historical.exclude>
  </>
);

const PartyGamesWinsTable = ({ stats, t }: PartyGamesSubModeTableProps) => (
  <>
    <Table.tr>
      <Table.td title="Animal Slaughter" value={t(stats.animalSlaughterWins)} size="inline" color="§a" />
      <Table.td title="Anvil Spleef" value={t(stats.anvilSpleefWins)} size="inline" color="§a" />
      <Table.td title="Avalanche" value={t(stats.avalancheWins)} size="inline" color="§a" />
    </Table.tr>
    <Table.tr>
      <Table.td title="Bombardment" value={t(stats.bombardmentWins)} size="inline" color="§a" />
      <Table.td title="Cannon Painting" value={t(stats.cannonPaintingWins)} size="inline" color="§a" />
      <Table.td title="Chicken Rings" value={t(stats.chickenRingsWins)} size="inline" color="§a" />
    </Table.tr>
    <Table.tr>
      <Table.td title="Dive" value={t(stats.diveWins)} size="inline" color="§a" />
      <Table.td title="Fire Leapers" value={t(stats.fireLeapersWins)} size="inline" color="§a" />
      <Table.td title="Frozen Floor" value={t(stats.frozenFloorWins)} size="inline" color="§a" />
    </Table.tr>
    <Table.tr>
      <Table.td title="High Ground" value={t(stats.highGroundWins)} size="inline" color="§a" />
      <Table.td title="Hoe Hoe Hoe" value={t(stats.hoeHoeHoeWins)} size="inline" color="§a" />
      <Table.td title="Jigsaw Rush" value={t(stats.jigsawRushWins)} size="inline" color="§a" />
    </Table.tr>
    <Table.tr>
      <Table.td title="Jungle Jump" value={t(stats.jungleJumpWins)} size="inline" color="§a" />
      <Table.td title="Lab Escape" value={t(stats.labEscapeWins)} size="inline" color="§a" />
      <Table.td title="Lawn Moower" value={t(stats.lawnMoowerWins)} size="inline" color="§a" />
    </Table.tr>
    <Table.tr>
      <Table.td title="Minecart Racing" value={t(stats.minecartRacingWins)} size="inline" color="§a" />
      <Table.td title="Pig Fishing" value={t(stats.pigFishingWins)} size="inline" color="§a" />
      <Table.td title="Pig Jousting" value={t(stats.pigJoustingWins)} size="inline" color="§a" />
    </Table.tr>
    <Table.tr>
      <Table.td title="RPG-16" value={t(stats.rpg16Wins)} size="inline" color="§a" />
      <Table.td title="Shooting Range" value={t(stats.shootingRangeWins)} size="inline" color="§a" />
      <Table.td title="Spider Maze" value={t(stats.spiderMazeWins)} size="inline" color="§a" />
    </Table.tr>
    <Table.tr>
      <Table.td title="Super Sheep" value={t(stats.superSheepWins)} size="inline" color="§a" />
      <Table.td title="The Floor Is Lava" value={t(stats.theFloorIsLavaWins)} size="inline" color="§a" />
      <Table.td title="Trampolinio" value={t(stats.trampolinioWins)} size="inline" color="§a" />
    </Table.tr>
    <Table.tr>
      <Table.td title="Volcano" value={t(stats.volcanoWins)} size="inline" color="§a" />
      <Table.td title="Workshop" value={t(stats.workshopWins)} size="inline" color="§a" />
    </Table.tr>
  </>
);
