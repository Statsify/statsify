/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Container, Footer, Header, type SidebarItem, Table } from "#components";
import { Empty } from "./components/Empty.js";
import { PLAYER_STATS, RARITY_COLORS } from "@statsify/skyblock/display";
import { gridRows } from "./components/ItemGrid.js";
import { prettify } from "@statsify/util";
import type { SkyBlockProfileProps } from "./skyblock.command.js";
import type { StatGroup } from "@statsify/skyblock";

const STATS = new Map(PLAYER_STATS.map((stat) => [stat.id, stat]));
const ATTRIBUTES = 30;

// Seven groups as seven buttons crowd the profile menu, so the gathering skills share a page
export const STAT_PAGES = {
  combat: ["combat"],
  gathering: ["mining", "farming", "foraging", "fishing"],
  misc: ["misc", "wisdoms"],
} as const satisfies Record<string, StatGroup[]>;

export interface SkyBlockStatsProfileProps extends SkyBlockProfileProps {
  page: keyof typeof STAT_PAGES;
}

export const SkyBlockStatsProfile = ({
  profile,
  title,
  skin,
  badge,
  background,
  logo,
  user,
  t,
  page,
}: SkyBlockStatsProfileProps) => {
  const { stats } = profile.member;
  const sidebar: SidebarItem[] = stats?.weapon ? [[t("skyblock.weapon"), stats.weapon, "§f"]] : [];

  const groups = STAT_PAGES[page].flatMap((group) => {
    const cells = (stats?.stats ?? []).flatMap(({ stat, total }) => {
      const info = STATS.get(stat);
      if (!info || info.group !== group) return [];
      const value = `${t(Math.round(total * 10) / 10)}${"percent" in info && info.percent ? "%" : ""}`;
      return [<Table.td title={`${info.symbol} ${prettify(stat)}`} value={value} color={info.color} size="small" />];
    });

    return cells.length > 0 ? [<Table.ts title={`§e${t(`skyblock.statGroups.${group}`)}`}>{gridRows(cells, 4)}</Table.ts>] : [];
  });

  return (
    <Container background={background}>
      <Header skin={skin} name={profile.displayName} badge={badge} sidebar={sidebar} title={title} time="LIVE" />
      {groups.length > 0 ? <Table.table>{groups}</Table.table> : <Empty text={t("skyblock.noStats")} />}
      <Footer logo={logo} user={user} />
    </Container>
  );
};

export const SkyBlockAttributesProfile = ({
  profile,
  title,
  skin,
  badge,
  background,
  logo,
  user,
  t,
}: SkyBlockProfileProps) => {
  const attributes = profile.member.attributes!;
  // A late-game member has 200+ unlocked, so the ones still levelling come first
  const shown = attributes.attributes
    .filter(({ level }) => level > 0)
    .toSorted((a, b) => Number(a.level === a.maxLevel) - Number(b.level === b.maxLevel) || b.level - a.level)
    .slice(0, ATTRIBUTES);

  const sidebar: SidebarItem[] = [
    [t("skyblock.unlocked"), `${t(attributes.unlocked)}§7/${t(attributes.total)}`, "§a"],
    [t("skyblock.maxed"), t(attributes.maxed), "§6"],
    [t("skyblock.shardsOwned"), t(attributes.owned), "§b"],
  ];

  const cells = shown.map(({ attribute, rarity, level, maxLevel }) => (
    <Table.td
      title={attribute}
      value={`${level === maxLevel ? "§6" : "§e"}${t(level)}§7/${t(maxLevel)}`}
      color={RARITY_COLORS[rarity]}
      size="small"
    />
  ));

  return (
    <Container background={background}>
      <Header skin={skin} name={profile.displayName} badge={badge} sidebar={sidebar} title={title} time="LIVE" />
      {cells.length > 0 ? <Table.table>{gridRows(cells, 3)}</Table.table> : <Empty text={t("skyblock.noAttributes")} />}
      <Footer logo={logo} user={user} />
    </Container>
  );
};
