/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Card } from "./components/Card.js";
import { type SidebarItem, Table } from "#components";
import { Empty } from "./components/Empty.js";
import { PLAYER_STATS, RARITY_COLORS } from "@statsify/skyblock/display";
import { gridRows, formatProgress } from "./components/ItemGrid.js";
import { prettify } from "@statsify/util";
import type { SkyBlockProfileProps } from "./skyblock.command.js";
import type { StatGroup } from "@statsify/skyblock";

const STATS = new Map(PLAYER_STATS.map((stat) => [stat.id, stat]));
const ATTRIBUTES = 30;

// Seven pages would crowd the profile menu, so gathering skills share one.
export const STAT_PAGES = {
  combat: ["combat"],
  gathering: ["mining", "farming", "foraging", "fishing"],
  misc: ["misc", "wisdoms"],
} as const satisfies Record<string, StatGroup[]>;

// Gathering's long fortune names would widen the card at four to a row.
const COLUMNS: Record<keyof typeof STAT_PAGES, number> = {
  combat: 4,
  gathering: 3,
  misc: 4,
};

interface SkyBlockStatsProfileProps extends SkyBlockProfileProps {
  page: keyof typeof STAT_PAGES;
}

export const SkyBlockStatsProfile = ({
  profile,
  t,
  page,
  ...card
}: SkyBlockStatsProfileProps) => {
  const { stats } = profile.member;
  const sidebar: SidebarItem[] = stats?.weapon
    ? [[t("skyblock.weapon"), stats.weapon, "§f"]]
    : [];

  const groups: JSX.Element[] = [];
  for (const group of STAT_PAGES[page]) {
    const cells: JSX.Element[] = [];
    for (const { stat, total } of stats?.stats ?? []) {
      const info = STATS.get(stat);
      if (!info || info.group !== group) continue;

      const unit = "percent" in info && info.percent ? "%" : "";
      cells.push(
        <Table.td
          title={`${info.symbol} ${prettify(stat)}`}
          value={`${t(Math.round(total * 10) / 10)}${unit}`}
          color={info.color}
          size="small"
        />,
      );
    }

    if (cells.length === 0) continue;
    groups.push(
      <Table.ts title={`§e${t(`skyblock.statGroups.${group}`)}`}>
        {gridRows(cells, COLUMNS[page], { spreadLastRow: true })}
      </Table.ts>,
    );
  }

  return (
    <Card {...card} name={profile.displayName} sidebar={sidebar}>
      {groups.length > 0 ? (
        <Table.table>{groups}</Table.table>
      ) : (
        <Empty text={t("skyblock.noStats")} />
      )}
    </Card>
  );
};

export const SkyBlockAttributesProfile = ({
  profile,
  t,
  ...card
}: SkyBlockProfileProps) => {
  const attributes = profile.member.attributes!;
  // A late-game member has 200+ unlocked, so the ones still leveling come first
  const shown = attributes.attributes
    .filter(({ level }) => level > 0)
    .toSorted(
      (a, b) =>
        Number(a.level === a.maxLevel) - Number(b.level === b.maxLevel) ||
        b.level - a.level,
    )
    .slice(0, ATTRIBUTES);

  const sidebar: SidebarItem[] = [
    [
      t("skyblock.unlocked"),
      `${t(attributes.unlocked)}§7/${t(attributes.total)}`,
      "§a",
    ],
    [t("skyblock.maxed"), t(attributes.maxed), "§6"],
    [t("skyblock.shardsOwned"), t(attributes.owned), "§b"],
  ];

  const cells = shown.map(({ attribute, rarity, level, maxLevel }) => (
    <Table.td
      title={attribute}
      value={formatProgress(t, level, maxLevel)}
      color={RARITY_COLORS[rarity]}
      size="small"
    />
  ));

  return (
    <Card {...card} name={profile.displayName} sidebar={sidebar}>
      {cells.length > 0 ? (
        <Table.table>{gridRows(cells, 3, { spreadLastRow: true })}</Table.table>
      ) : (
        <Empty text={t("skyblock.noAttributes")} />
      )}
    </Card>
  );
};
