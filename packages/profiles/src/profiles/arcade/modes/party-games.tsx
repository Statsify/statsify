/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ARCADE, cardColors } from "@statsify/catalog";
import { Historical, Table } from "../../../components/index.js";
import { formatRaceTime } from "@statsify/util";
import type { ArcadeModes, PartyGames, SubModeForMode } from "@statsify/schemas";
import type { LocalizeFunction, ProfileTime } from "../../../types.js";

const color = cardColors(ARCADE, "partyGames");

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
      <Table.td title={t("stats.wins")} value={t(stats.wins)} color={color("wins")} />
      <Table.td title={t("stats.roundWins")} value={t(stats.roundsWon)} color={color("roundsWon")} />
      <Table.td title={t("stats.starsEarned")} value={t(stats.starsEarned)} color={color("starsEarned")} />
    </Table.tr>
    <Historical.include time={time}>
      <Table.ts title={t("stats.roundWins")}>
        <PartyGamesWinsTable stats={stats} t={t} time={time} />
      </Table.ts>
    </Historical.include>
    <Historical.exclude time={time}>
      <Table.ts title="Best Times">
        <Table.tr>
          <Table.td title="Anvil Spleef" value={stats.anvilSpleefBestTime === 0 ? "§7N/A" : formatRaceTime(stats.anvilSpleefBestTime)} color={color("anvilSpleefBestTime")} size="inline" />
          <Table.td title="Lab Escape" value={stats.labEscapeBestTime === 0 ? "§7N/A" : formatRaceTime(stats.labEscapeBestTime)} color={color("labEscapeBestTime")} size="inline" />
          <Table.td title="Jigsaw Rush" value={stats.jigsawRushBestTime === 0 ? "§7N/A" : formatRaceTime(stats.jigsawRushBestTime)} color={color("jigsawRushBestTime")} size="inline" />
        </Table.tr>
        <Table.tr>
          <Table.td title="The Floor Is Lava" value={stats.theFloorIsLavaBestTime === 0 ? "§7N/A" : formatRaceTime(stats.theFloorIsLavaBestTime)} color={color("theFloorIsLavaBestTime")} size="inline" />
          <Table.td title="Chicken Rings" value={stats.chickenRingsBestTime === 0 ? "§7N/A" : formatRaceTime(stats.chickenRingsBestTime)} color={color("chickenRingsBestTime")} size="inline" />
          <Table.td title="Jungle Jump" value={stats.jungleJumpBestTime === 0 ? "§7N/A" : formatRaceTime(stats.jungleJumpBestTime)} color={color("jungleJumpBestTime")} size="inline" />
        </Table.tr>
        <Table.tr>
          <Table.td title="Bombardment" value={stats.bombardmentBestTime === 0 ? "§7N/A" : formatRaceTime(stats.bombardmentBestTime)} color={color("bombardmentBestTime")} size="inline" />
          <Table.td title="Minecart Racing" value={stats.minecartRacingBestTime === 0 ? "§7N/A" : formatRaceTime(stats.minecartRacingBestTime)} color={color("minecartRacingBestTime")} size="inline" />
          <Table.td title="Spider Maze" value={stats.spiderMazeBestTime === 0 ? "§7N/A" : formatRaceTime(stats.spiderMazeBestTime)} color={color("spiderMazeBestTime")} size="inline" />
        </Table.tr>
      </Table.ts>
      <Table.ts title="Best Scores">
        <Table.tr>
          <Table.td title="Animal Slaughter" value={t(stats.animalSlaughterBestScore)} color={color("animalSlaughterBestScore")} size="inline" />
          <Table.td title="Dive" value={t(stats.diveBestScore)} color={color("diveBestScore")} size="inline" />
          <Table.td title="High Ground" value={t(stats.highGroundBestScore)} color={color("highGroundBestScore")} size="inline" />
        </Table.tr>
        <Table.tr>
          <Table.td title="Hoe Hoe Hoe" value={t(stats.hoeHoeHoeBestScore)} color={color("hoeHoeHoeBestScore")} size="inline" />
          <Table.td title="Lawn Moower" value={t(stats.lawnMoowerBestScore)} color={color("lawnMoowerBestScore")} size="inline" />
          <Table.td title="RPG-16" value={t(stats.rpg16BestScore)} color={color("rpg16BestScore")} size="inline" />
        </Table.tr>
      </Table.ts>
    </Historical.exclude>
  </>
);

const PartyGamesWinsTable = ({ stats, t }: PartyGamesSubModeTableProps) => (
  <>
    <Table.tr>
      <Table.td title="Animal Slaughter" value={t(stats.animalSlaughterWins)} size="inline" color={color("animalSlaughterWins")} />
      <Table.td title="Anvil Spleef" value={t(stats.anvilSpleefWins)} size="inline" color={color("anvilSpleefWins")} />
      <Table.td title="Avalanche" value={t(stats.avalancheWins)} size="inline" color={color("avalancheWins")} />
    </Table.tr>
    <Table.tr>
      <Table.td title="Bombardment" value={t(stats.bombardmentWins)} size="inline" color={color("bombardmentWins")} />
      <Table.td title="Cannon Painting" value={t(stats.cannonPaintingWins)} size="inline" color={color("cannonPaintingWins")} />
      <Table.td title="Chicken Rings" value={t(stats.chickenRingsWins)} size="inline" color={color("chickenRingsWins")} />
    </Table.tr>
    <Table.tr>
      <Table.td title="Dive" value={t(stats.diveWins)} size="inline" color={color("diveWins")} />
      <Table.td title="Fire Leapers" value={t(stats.fireLeapersWins)} size="inline" color={color("fireLeapersWins")} />
      <Table.td title="Frozen Floor" value={t(stats.frozenFloorWins)} size="inline" color={color("frozenFloorWins")} />
    </Table.tr>
    <Table.tr>
      <Table.td title="High Ground" value={t(stats.highGroundWins)} size="inline" color={color("highGroundWins")} />
      <Table.td title="Hoe Hoe Hoe" value={t(stats.hoeHoeHoeWins)} size="inline" color={color("hoeHoeHoeWins")} />
      <Table.td title="Jigsaw Rush" value={t(stats.jigsawRushWins)} size="inline" color={color("jigsawRushWins")} />
    </Table.tr>
    <Table.tr>
      <Table.td title="Jungle Jump" value={t(stats.jungleJumpWins)} size="inline" color={color("jungleJumpWins")} />
      <Table.td title="Lab Escape" value={t(stats.labEscapeWins)} size="inline" color={color("labEscapeWins")} />
      <Table.td title="Lawn Moower" value={t(stats.lawnMoowerWins)} size="inline" color={color("lawnMoowerWins")} />
    </Table.tr>
    <Table.tr>
      <Table.td title="Minecart Racing" value={t(stats.minecartRacingWins)} size="inline" color={color("minecartRacingWins")} />
      <Table.td title="Pig Fishing" value={t(stats.pigFishingWins)} size="inline" color={color("pigFishingWins")} />
      <Table.td title="Pig Jousting" value={t(stats.pigJoustingWins)} size="inline" color={color("pigJoustingWins")} />
    </Table.tr>
    <Table.tr>
      <Table.td title="RPG-16" value={t(stats.rpg16Wins)} size="inline" color={color("rpg16Wins")} />
      <Table.td title="Shooting Range" value={t(stats.shootingRangeWins)} size="inline" color={color("shootingRangeWins")} />
      <Table.td title="Spider Maze" value={t(stats.spiderMazeWins)} size="inline" color={color("spiderMazeWins")} />
    </Table.tr>
    <Table.tr>
      <Table.td title="Super Sheep" value={t(stats.superSheepWins)} size="inline" color={color("superSheepWins")} />
      <Table.td title="The Floor Is Lava" value={t(stats.theFloorIsLavaWins)} size="inline" color={color("theFloorIsLavaWins")} />
      <Table.td title="Trampolinio" value={t(stats.trampolinioWins)} size="inline" color={color("trampolinioWins")} />
    </Table.tr>
    <Table.tr>
      <Table.td title="Volcano" value={t(stats.volcanoWins)} size="inline" color={color("volcanoWins")} />
      <Table.td title="Workshop" value={t(stats.workshopWins)} size="inline" color={color("workshopWins")} />
    </Table.tr>
  </>
);
