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
import { gridRows } from "./components/ItemGrid.js";
import { CLASS_COLORS, DUNGEON_CLASSES, GRADE_COLORS } from "@statsify/skyblock/display";
import type { SkyBlockProfileProps } from "./skyblock.command.js";

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

  if (mode === "normal") sidebar.push([t("skyblock.watcherKills"), t(dungeons.watcherKills), "§4"]);

  const classes = DUNGEON_CLASSES.map((name) => {
    const color = CLASS_COLORS[name];
    const damage = dungeons.mostDamage[mode][name];
    const note = damage > 0 ? `§7${t("skyblock.mostDamage")}: ${color}${t(Math.floor(damage))}` : undefined;
    return <LevelBar title={prettify(name)} level={dungeons.classes[name]} color={color} t={t} note={note} />;
  });

  const time = (ms?: number) => (ms === undefined ? none : formatTime(ms));

  const floors = dungeons.floors[mode]
    .filter(({ played }) => played > 0)
    .map(({ floor, completions, best, fastest, fastestS, fastestSPlus }) => (
      <box direction="column" location="center" width="100%">
        <text margin={{ top: 8, bottom: 4, left: 6, right: 6 }}>{`§l§c${floorName(floor)}`}</text>
        <text margin={{ top: 0, bottom: 2 }}>{`§7${t("skyblock.completions")}: §a${t(completions)}`}</text>
        <text margin={{ top: 0, bottom: 2 }}>
          {`§7${t("skyblock.bestScore")}: §e${best ? `${t(best.score)} ${GRADE_COLORS[best.grade]}${best.grade}` : none}`}
        </text>
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

export const SkyBlockEssenceProfile = ({
  profile,
  title,
  skin,
  badge,
  background,
  logo,
  user,
  t,
}: SkyBlockProfileProps) => {
  const { essence } = profile.member.dungeons!;

  const cells = essence.map(({ type, amount, perks, maxPerks }) => (
    <box direction="column" location="center" width="100%">
      <text margin={{ top: 8, bottom: 4, left: 6, right: 6 }}>{`§d${prettify(type)}`}</text>
      <text margin={{ top: 0, bottom: 4, left: 10, right: 10 }}>
        {amount === undefined ? `§^3^§7${t("skyblock.notAvailable")}` : `§^3^§f${t(amount)}`}
      </text>
      <text margin={{ top: 0, bottom: 8, left: 10, right: 10 }}>
        {`§7${t("skyblock.perksBought", { bought: t(perks), total: t(maxPerks) })}`}
      </text>
    </box>
  ));

  return (
    <Container background={background}>
      <Header skin={skin} name={profile.displayName} badge={badge} title={title} time="LIVE" />
      <Table.table>{gridRows(cells, 4)}</Table.table>
      <Footer logo={logo} user={user} />
    </Container>
  );
};
