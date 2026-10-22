/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ARCADE, cardColours } from "@statsify/catalog";
import { Historical, Table } from "../../../components/index.js";
import { formatRaceTime } from "@statsify/util";
import type { ArcadeModes, PartyGames, SubModeForMode } from "@statsify/schemas";
import type { LocalizeFunction, ProfileTime } from "../../../types.js";

const colour = cardColours(ARCADE, "partyGames");

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
      <Table.td title={t("stats.wins")} value={t(stats.wins)} color={colour("wins")} />
      <Table.td title={t("stats.roundWins")} value={t(stats.roundsWon)} color={colour("roundsWon")} />
      <Table.td title={t("stats.starsEarned")} value={t(stats.starsEarned)} color={colour("starsEarned")} />
    </Table.tr>
    <Historical.include time={time}>
      <Table.ts title={t("stats.roundWins")}>
        <PartyGamesWinsTable stats={stats} t={t} time={time} />
      </Table.ts>
    </Historical.include>
    <Historical.exclude time={time}>
      <Table.ts title="Best Times">
        <Table.tr>
          <Table.td title="Anvil Spleef" value={stats.anvilSpleefBestTime === 0 ? "§7N/A" : formatRaceTime(stats.anvilSpleefBestTime)} color={colour("anvilSpleefBestTime")} size="inline" />
          <Table.td title="Lab Escape" value={stats.labEscapeBestTime === 0 ? "§7N/A" : formatRaceTime(stats.labEscapeBestTime)} color={colour("labEscapeBestTime")} size="inline" />
          <Table.td title="Jigsaw Rush" value={stats.jigsawRushBestTime === 0 ? "§7N/A" : formatRaceTime(stats.jigsawRushBestTime)} color={colour("jigsawRushBestTime")} size="inline" />
        </Table.tr>
        <Table.tr>
          <Table.td title="The Floor Is Lava" value={stats.theFloorIsLavaBestTime === 0 ? "§7N/A" : formatRaceTime(stats.theFloorIsLavaBestTime)} color={colour("theFloorIsLavaBestTime")} size="inline" />
          <Table.td title="Chicken Rings" value={stats.chickenRingsBestTime === 0 ? "§7N/A" : formatRaceTime(stats.chickenRingsBestTime)} color={colour("chickenRingsBestTime")} size="inline" />
          <Table.td title="Jungle Jump" value={stats.jungleJumpBestTime === 0 ? "§7N/A" : formatRaceTime(stats.jungleJumpBestTime)} color={colour("jungleJumpBestTime")} size="inline" />
        </Table.tr>
        <Table.tr>
          <Table.td title="Bombardment" value={stats.bombardmentBestTime === 0 ? "§7N/A" : formatRaceTime(stats.bombardmentBestTime)} color={colour("bombardmentBestTime")} size="inline" />
          <Table.td title="Minecart Racing" value={stats.minecartRacingBestTime === 0 ? "§7N/A" : formatRaceTime(stats.minecartRacingBestTime)} color={colour("minecartRacingBestTime")} size="inline" />
          <Table.td title="Spider Maze" value={stats.spiderMazeBestTime === 0 ? "§7N/A" : formatRaceTime(stats.spiderMazeBestTime)} color={colour("spiderMazeBestTime")} size="inline" />
        </Table.tr>
      </Table.ts>
      <Table.ts title="Best Scores">
        <Table.tr>
          <Table.td title="Animal Slaughter" value={t(stats.animalSlaughterBestScore)} color={colour("animalSlaughterBestScore")} size="inline" />
          <Table.td title="Dive" value={t(stats.diveBestScore)} color={colour("diveBestScore")} size="inline" />
          <Table.td title="High Ground" value={t(stats.highGroundBestScore)} color={colour("highGroundBestScore")} size="inline" />
        </Table.tr>
        <Table.tr>
          <Table.td title="Hoe Hoe Hoe" value={t(stats.hoeHoeHoeBestScore)} color={colour("hoeHoeHoeBestScore")} size="inline" />
          <Table.td title="Lawn Moower" value={t(stats.lawnMoowerBestScore)} color={colour("lawnMoowerBestScore")} size="inline" />
          <Table.td title="RPG-16" value={t(stats.rpg16BestScore)} color={colour("rpg16BestScore")} size="inline" />
        </Table.tr>
      </Table.ts>
    </Historical.exclude>
  </>
);

const PartyGamesWinsTable = ({ stats, t }: PartyGamesSubModeTableProps) => (
  <>
    <Table.tr>
      <Table.td title="Animal Slaughter" value={t(stats.animalSlaughterWins)} size="inline" color={colour("animalSlaughterWins")} />
      <Table.td title="Anvil Spleef" value={t(stats.anvilSpleefWins)} size="inline" color={colour("anvilSpleefWins")} />
      <Table.td title="Avalanche" value={t(stats.avalancheWins)} size="inline" color={colour("avalancheWins")} />
    </Table.tr>
    <Table.tr>
      <Table.td title="Bombardment" value={t(stats.bombardmentWins)} size="inline" color={colour("bombardmentWins")} />
      <Table.td title="Cannon Painting" value={t(stats.cannonPaintingWins)} size="inline" color={colour("cannonPaintingWins")} />
      <Table.td title="Chicken Rings" value={t(stats.chickenRingsWins)} size="inline" color={colour("chickenRingsWins")} />
    </Table.tr>
    <Table.tr>
      <Table.td title="Dive" value={t(stats.diveWins)} size="inline" color={colour("diveWins")} />
      <Table.td title="Fire Leapers" value={t(stats.fireLeapersWins)} size="inline" color={colour("fireLeapersWins")} />
      <Table.td title="Frozen Floor" value={t(stats.frozenFloorWins)} size="inline" color={colour("frozenFloorWins")} />
    </Table.tr>
    <Table.tr>
      <Table.td title="High Ground" value={t(stats.highGroundWins)} size="inline" color={colour("highGroundWins")} />
      <Table.td title="Hoe Hoe Hoe" value={t(stats.hoeHoeHoeWins)} size="inline" color={colour("hoeHoeHoeWins")} />
      <Table.td title="Jigsaw Rush" value={t(stats.jigsawRushWins)} size="inline" color={colour("jigsawRushWins")} />
    </Table.tr>
    <Table.tr>
      <Table.td title="Jungle Jump" value={t(stats.jungleJumpWins)} size="inline" color={colour("jungleJumpWins")} />
      <Table.td title="Lab Escape" value={t(stats.labEscapeWins)} size="inline" color={colour("labEscapeWins")} />
      <Table.td title="Lawn Moower" value={t(stats.lawnMoowerWins)} size="inline" color={colour("lawnMoowerWins")} />
    </Table.tr>
    <Table.tr>
      <Table.td title="Minecart Racing" value={t(stats.minecartRacingWins)} size="inline" color={colour("minecartRacingWins")} />
      <Table.td title="Pig Fishing" value={t(stats.pigFishingWins)} size="inline" color={colour("pigFishingWins")} />
      <Table.td title="Pig Jousting" value={t(stats.pigJoustingWins)} size="inline" color={colour("pigJoustingWins")} />
    </Table.tr>
    <Table.tr>
      <Table.td title="RPG-16" value={t(stats.rpg16Wins)} size="inline" color={colour("rpg16Wins")} />
      <Table.td title="Shooting Range" value={t(stats.shootingRangeWins)} size="inline" color={colour("shootingRangeWins")} />
      <Table.td title="Spider Maze" value={t(stats.spiderMazeWins)} size="inline" color={colour("spiderMazeWins")} />
    </Table.tr>
    <Table.tr>
      <Table.td title="Super Sheep" value={t(stats.superSheepWins)} size="inline" color={colour("superSheepWins")} />
      <Table.td title="The Floor Is Lava" value={t(stats.theFloorIsLavaWins)} size="inline" color={colour("theFloorIsLavaWins")} />
      <Table.td title="Trampolinio" value={t(stats.trampolinioWins)} size="inline" color={colour("trampolinioWins")} />
    </Table.tr>
    <Table.tr>
      <Table.td title="Volcano" value={t(stats.volcanoWins)} size="inline" color={colour("volcanoWins")} />
      <Table.td title="Workshop" value={t(stats.workshopWins)} size="inline" color={colour("workshopWins")} />
    </Table.tr>
  </>
);
