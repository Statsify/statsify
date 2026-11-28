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
import type { ItemTexture } from "@statsify/skyblock";
import type { LocalizeFunction } from "@statsify/discord";

export const formatPriceAge = (t: LocalizeFunction, asOf: number) =>
  t("skyblock.pricesAsOf", {
    time: formatTime(Date.now() - asOf, { entries: 1 }),
  });

export const formatProgress = (
  t: LocalizeFunction,
  value: number,
  max: number,
) => `${value >= max ? "§6" : "§e"}${t(value)}§7/${t(max)}`;

interface GridRowsOptions {
  spreadLastRow?: boolean;
}

// Table.tr splits its width by cell, so a short last row gets padding.
export const getGridRows = (
  cells: JSX.Element[],
  columns: number,
  { spreadLastRow = false }: GridRowsOptions = {},
) =>
  arrayGroup(cells, columns).map((row) => (
    <Table.tr>
      {spreadLastRow
        ? row
        : [
            ...row,
            ...Array.from({ length: columns - row.length }, () => <div />),
          ]}
    </Table.tr>
  ));

export interface ItemGridEntry {
  texture?: ItemTexture;
  badge?: ItemTexture;
  name: string;
  value: string;
}

export interface ItemGridProps {
  items: ItemGridEntry[];
  icons: ItemIcons;
  columns?: number;
  // A long value goes under the name, so it doesn't widen the card.
  stacked?: boolean;
  spreadLastRow?: boolean;
}

export const ItemGrid = ({
  items,
  icons,
  columns = 2,
  stacked = false,
  spreadLastRow = false,
}: ItemGridProps) => {
  const cells = items.map(({ texture, badge, name, value }) => (
    <box width="100%" padding={{ left: 8, right: 8, top: 4, bottom: 4 }}>
      <ItemSlot icon={texture && icons.get(texture)} />
      {badge && icons.has(badge) ? (
        <img
          image={icons.get(badge)!}
          width={16}
          height={16}
          margin={{ left: -14, top: 18 }}
        />
      ) : (
        <></>
      )}
      {stacked ? (
        <>
          {/* Left-aligned, so a wide card's cells line up down a column. */}
          <div direction="column" margin={{ left: 8, right: 4 }}>
            <text align="left" margin={{ top: 0, bottom: 2 }}>
              {name}
            </text>
            <text align="left" margin={{ top: 0, bottom: 0 }}>
              {value}
            </text>
          </div>
          <div width="remaining" />
        </>
      ) : (
        <>
          <text margin={{ left: 8, right: 4, top: 6, bottom: 6 }}>{name}</text>
          <div width="remaining" margin={{ left: 4, right: 4 }} />
          <text>{value}</text>
        </>
      )}
    </box>
  ));

  return (
    <Table.table>{getGridRows(cells, columns, { spreadLastRow })}</Table.table>
  );
};
