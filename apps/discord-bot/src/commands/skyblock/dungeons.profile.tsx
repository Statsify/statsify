/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Container, Footer, Header, type SidebarItem, Table } from "#components";
import { Empty } from "./components/Empty.js";
import { LevelBar } from "./components/LevelBar.js";
import { arrayGroup, formatTime, prettify } from "@statsify/util";
import type { SkyBlockProfileProps } from "./skyblock.command.js";

const CLASSES = {
  healer: "§d",
  mage: "§b",
  berserk: "§c",
  archer: "§6",
  tank: "§7",
};

export interface SkyBlockDungeonsProfileProps extends SkyBlockProfileProps {
  mode: "normal" | "master";
}

export const SkyBlockDungeonsProfile = ({
  profile,
  title,
  skin,
  badge,
  background,
  logo,
  user,
  t,
  mode,
}: SkyBlockDungeonsProfileProps) => {
  const dungeons = profile.member.dungeons!;
  const none = t("skyblock.none");

  const floorKey = mode === "master" ? "skyblock.masterFloor" : "skyblock.floor";
  const floorName = (floor: number) => (floor === 0 ? t("skyblock.entrance") : t(floorKey, { floor }));
  const highest = dungeons.highestFloor[mode];

  const sidebar: SidebarItem[] = [
    [t("skyblock.classAverage"), t(dungeons.classAverage), "§2"],
    [t("skyblock.secrets"), t(dungeons.secrets), "§b"],
    [t("stats.class"), dungeons.selectedClass ? prettify(dungeons.selectedClass) : none, "§e"],
    [t("skyblock.highestFloor"), highest === undefined ? none : floorName(highest), "§c"],
  ];

  const classes = Object.entries(CLASSES).map(([name, color]) => (
    <LevelBar title={prettify(name)} level={dungeons.classes[name]} color={color} t={t} />
  ));

  const time = (ms?: number) => (ms === undefined ? none : formatTime(ms));

  const floors = dungeons.floors[mode]
    .filter(({ played }) => played > 0)
    .map(({ floor, completions, bestScore, fastest, fastestS, fastestSPlus }) => (
      <box direction="column" location="center" width="100%">
        <text margin={{ top: 8, bottom: 4, left: 6, right: 6 }}>{`§l§c${floorName(floor)}`}</text>
        <text margin={{ top: 0, bottom: 2 }}>{`§7${t("skyblock.completions")}: §a${t(completions)}`}</text>
        <text margin={{ top: 0, bottom: 2 }}>{`§7${t("skyblock.bestScore")}: §e${bestScore === undefined ? none : t(bestScore)}`}</text>
        <text margin={{ top: 0, bottom: 2 }}>{`§7${t("skyblock.fastest")}: §6${time(fastest)}`}</text>
        <text margin={{ top: 0, bottom: 2 }}>{`§7${t("skyblock.fastestS")}: §6${time(fastestS)}`}</text>
        <text margin={{ top: 0, bottom: 8 }}>{`§7${t("skyblock.fastestSPlus")}: §6${time(fastestSPlus)}`}</text>
      </box>
    ));

  return (
    <Container background={background}>
      <Header skin={skin} name={profile.displayName} badge={badge} sidebar={sidebar} title={title} time="LIVE" />
      <Table.table>
        {[
          <Table.tr>
            <LevelBar title={t("skyblock.catacombs")} level={dungeons.catacombs} color="§c" t={t} />
          </Table.tr>,
          <Table.tr>{classes}</Table.tr>,
          ...(floors.length > 0 ?
            arrayGroup(floors, 4).map((row) => <Table.tr>{row}</Table.tr>) :
            [
              <Table.tr>
                <Empty text={t("skyblock.noRuns")} />
              </Table.tr>,
            ]),
        ]}
      </Table.table>
      <Footer logo={logo} user={user} />
    </Container>
  );
};
