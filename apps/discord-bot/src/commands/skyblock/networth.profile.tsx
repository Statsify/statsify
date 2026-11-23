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
import { ItemGrid, pricesAsOf } from "./components/ItemGrid.js";
import { arrayGroup, prettify } from "@statsify/util";
import type { MemberView, NetworthSection } from "@statsify/skyblock";
import type { SkyBlockProfileProps } from "./skyblock.command.js";

const TOP_ITEMS = 10;

const topItems = ({ categories }: NetworthSection) =>
  Object.values(categories)
    .flatMap(({ top }) => top)
    .toSorted((a, b) => b.price - a.price)
    .slice(0, TOP_ITEMS);

export const networthIcons = ({ networth }: MemberView) =>
  topItems(networth!).flatMap(({ texture }) => (texture ? [texture] : []));

export const SkyBlockNetworthProfile = ({ profile, t, icons, ...card }: SkyBlockProfileProps) => {
  const networth = profile.member.networth!;

  const sidebar: SidebarItem[] = [
    [t("skyblock.networth"), t(Math.floor(networth.total)), "§6"],
    [t("skyblock.unsoulbound"), t(Math.floor(networth.unsoulbound)), "§e"],
    [t("skyblock.nonCosmetic"), t(Math.floor(networth.nonCosmetic.total)), "§a"],
  ];

  const categories = Object.entries(networth.categories)
    .filter(([, { total }]) => total > 0)
    .toSorted(([, a], [, b]) => b.total - a.total)
    .map(([name, { total }]) => (
      // prettify gives "Enderchest"; Hypixel calls it the Ender Chest
      <Table.td
        title={name === "enderchest" ? t("skyblock.enderChest") : prettify(name)}
        value={t(Math.floor(total))}
        color="§6"
        size="inline"
      />
    ));

  // Laid out two to a row: three long names like Carnival Mask Inventory in one row set the card's width
  const cells = [
    <Table.td title={t("stats.coins")} value={t(Math.floor(networth.coins))} color="§6" size="inline" />,
    ...categories,
  ];

  const items = topItems(networth).map(({ name, count, price, texture }) => ({
    texture,
    name: count > 1 ? `§f${name} §7x${t(count)}` : `§f${name}`,
    value: `§6${t(Math.floor(price))}`,
  }));

  const unpriced =
    networth.unpricedCount > 0 ? `${t("skyblock.unpriced", { count: networth.unpricedCount })} • ` : "";

  return (
    <Card {...card} name={profile.displayName} sidebar={sidebar}>
      <Table.table>
        {arrayGroup(cells, 2).map((row) => (
          <Table.tr>{row}</Table.tr>
        ))}
      </Table.table>
      {items.length > 0 ? <ItemGrid items={items} icons={icons} stacked /> : <></>}
      <Empty text={`${unpriced}${pricesAsOf(t, networth.pricesAsOf)}`} />
    </Card>
  );
};
