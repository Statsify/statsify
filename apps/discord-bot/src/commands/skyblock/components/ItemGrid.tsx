/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type ItemIcons, ItemSlot } from "./ItemSlot.js";
import { Table } from "#components";
import { arrayGroup, formatTime } from "@statsify/util";
import type { ItemTexture, JacobBracket, Rarity } from "@statsify/skyblock";
import type { LocalizeFunction } from "@statsify/discord";

export const RARITY_COLORS: Record<Rarity, string> = {
  COMMON: "§f",
  UNCOMMON: "§a",
  RARE: "§9",
  EPIC: "§5",
  LEGENDARY: "§6",
  MYTHIC: "§d",
  DIVINE: "§b",
  SPECIAL: "§c",
  VERY_SPECIAL: "§c",
  ULTIMATE: "§4",
  ADMIN: "§4",
};

export const MEDAL_COLORS: Record<JacobBracket, string> = {
  bronze: "§c",
  silver: "§f",
  gold: "§6",
  platinum: "§3",
  diamond: "§b",
};

export const pricesAsOf = (t: LocalizeFunction, asOf: number) =>
  t("skyblock.pricesAsOf", { time: formatTime(Date.now() - asOf, { entries: 1 }) });

// Table.tr splits its width by its cells, so a short last row is padded to keep the columns
export const gridRows = (cells: JSX.Element[], columns: number) =>
  arrayGroup(cells, columns).map((row) => (
    <Table.tr>{[...row, ...Array.from({ length: columns - row.length }, () => <div />)]}</Table.tr>
  ));

export interface ItemGridEntry {
  texture?: ItemTexture;
  badge?: ItemTexture; // drawn small over the slot's corner
  name: string;
  value: string;
}

export interface ItemGridProps {
  items: ItemGridEntry[];
  icons: ItemIcons;
  columns?: number;
}

export const ItemGrid = ({ items, icons, columns = 2 }: ItemGridProps) => {
  const cells = items.map(({ texture, badge, name, value }) => (
    <box width="100%" padding={{ left: 8, right: 8, top: 4, bottom: 4 }}>
      <ItemSlot icon={texture && icons.get(texture)} />
      {badge && icons.has(badge) ? <img image={icons.get(badge)!} width={16} height={16} margin={{ left: -14, top: 18 }} /> : <></>}
      <text margin={{ left: 8, right: 4, top: 6, bottom: 6 }}>{name}</text>
      <div width="remaining" margin={{ left: 4, right: 4 }} />
      <text>{value}</text>
    </box>
  ));

  return <Table.table>{gridRows(cells, columns)}</Table.table>;
};
