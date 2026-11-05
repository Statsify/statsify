/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Container, Footer, Header, SidebarItem, Table } from "#components";
import { type BedWarsModes, FormattedGame, type GameMode } from "@statsify/schemas";
import { formatRecordTime } from "@statsify/util";
import type { BaseProfileProps } from "#commands/base.hypixel-command";

const PRACTICE_MODES = [
  ["bridging", "fireballJumping"],
  ["mlg", "pearlClutching"],
] as const;

const BRIDGING_RECORDS = [
  ["straightShort", "straightMedium", "straightLong"],
  ["diagonalShort", "diagonalMedium", "diagonalLong"],
] as const;

export interface BedWarsPracticeProfileProps extends BaseProfileProps {
  mode: GameMode<BedWarsModes>;
}

export const BedWarsPracticeProfile = ({
  skin,
  player,
  background,
  logo,
  user,
  badge,
  mode,
  t,
  time,
}: BedWarsPracticeProfileProps) => {
  const { practice } = player.stats.bedwars;

  const sidebar: SidebarItem[] = [
    [t("stats.successes"), t(practice.overall.successes), "§a"],
    [t("stats.fails"), t(practice.overall.fails), "§c"],
    [t("stats.successRatio"), t(practice.overall.successRatio), "§6"],
    [t("stats.blocksPlaced"), t(practice.blocksPlaced), "§e"],
  ];

  return (
    <Container background={background}>
      <Header
        skin={skin}
        name={player.prefixName}
        badge={badge}
        sidebar={sidebar}
        title={`§l${FormattedGame.BEDWARS} §f${mode.formatted}`}
        time={time}
      />
      <Table.table>
        <>
          {PRACTICE_MODES.map((row) => (
            <Table.tr>
              {row.map((practiceMode) => (
                <Table.ts title={`§6${t(`stats.${practiceMode}`)}`}>
                  <Table.tr>
                    <Table.td
                      title={t("stats.successes")}
                      value={t(practice[practiceMode].successes)}
                      color="§a"
                      size="small"
                    />
                    <Table.td
                      title={t("stats.fails")}
                      value={t(practice[practiceMode].fails)}
                      color="§c"
                      size="small"
                    />
                    <Table.td
                      title={t("stats.successRatio")}
                      value={t(practice[practiceMode].successRatio)}
                      color="§6"
                      size="small"
                    />
                  </Table.tr>
                </Table.ts>
              ))}
            </Table.tr>
          ))}
        </>
        <Table.ts title={`§6${t("stats.bridgingRecords")}`}>
          {BRIDGING_RECORDS.map((row) => (
            <Table.tr>
              {row.map((record) => (
                <Table.td
                  title={t(`stats.${record}`)}
                  value={formatRecordTime(practice.bridgingRecords[record])}
                  color="§b"
                  size="small"
                />
              ))}
            </Table.tr>
          ))}
        </Table.ts>
      </Table.table>
      <Footer logo={logo} user={user} />
    </Container>
  );
};
