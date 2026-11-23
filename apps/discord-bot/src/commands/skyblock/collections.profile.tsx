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
import { EmptySection } from "./components/EmptySection.js";
import { ItemGrid, gridRows, progressText } from "./components/ItemGrid.js";
import { add } from "@statsify/math";
import type { CollectionCategory, MemberView } from "@statsify/skyblock";
import type { SkyBlockProfileProps } from "./skyblock.command.js";

const categoryItems = (collections: MemberView["collections"], category: CollectionCategory) =>
  collections?.categories.find(({ id }) => id === category)?.items ?? [];

export const collectionIcons = (category: CollectionCategory) => ({ collections }: MemberView) =>
  categoryItems(collections, category).flatMap(({ texture }) => (texture ? [texture] : []));

export const minionIcons = ({ minions }: MemberView) => minions?.minions.flatMap(({ texture }) => (texture ? [texture] : [])) ?? [];

export interface SkyBlockCollectionsProfileProps extends SkyBlockProfileProps {
  category: CollectionCategory;
}

export const SkyBlockCollectionsProfile = ({ profile, t, icons, category, ...card }: SkyBlockCollectionsProfileProps) => {
  const { collections } = profile.member;
  const items = categoryItems(collections, category);
  const tiersOnly = items.some(({ amount }) => amount === undefined);

  const sidebar: SidebarItem[] = collections ?
    [
      [t("skyblock.maxed"), `${t(collections.maxed)}§7/${t(collections.total)}`, "§6"],
      [t("skyblock.bossCollections"), t(collections.bosses.filter(({ amount }) => amount > 0).length), "§c"],
    ] :
    [];

  return (
    <Card {...card} name={profile.displayName} sidebar={sidebar}>
      {tiersOnly ? <Empty text={t("skyblock.collectionTiersOnly")} /> : <></>}
      {collections ?
        (
          <ItemGrid
            items={items.map(({ texture, name, amount, tier, maxTier }) => ({
              texture,
              name: `§f${name}`,
              value: amount === undefined ? progressText(t, tier, maxTier) : `§b${t(amount)} ${progressText(t, tier, maxTier)}`,
            }))}
            icons={icons}
            columns={3}
            stacked
            spreadLastRow
          />
        ) :
        <EmptySection setting="collections" newProfile={profile.newProfile} empty={t("skyblock.noCollections")} t={t} />}
    </Card>
  );
};

export const SkyBlockMinionsProfile = ({ profile, t, icons, ...card }: SkyBlockProfileProps) => {
  const minions = profile.member.minions!;
  const crafted = minions.minions.filter(({ tiers }) => tiers.length > 0);

  const sidebar: SidebarItem[] = [
    [t("skyblock.uniqueCrafts"), t(minions.unique), "§a"],
    [t("skyblock.minionSlots"), t(minions.slots.total), "§e"],
  ];

  if (minions.slots.next !== undefined)
    sidebar.push([t("skyblock.nextSlot"), t("skyblock.craftsToGo", { count: minions.slots.next - minions.unique }), "§7"]);

  return (
    <Card {...card} name={profile.displayName} sidebar={sidebar}>
      {crafted.length > 0 ?
        (
          <ItemGrid
            items={crafted.map(({ texture, name, tiers, maxTier }) => ({
              texture,
              name: `§f${name.replace(/ Minion$/, "")}`,
              value: progressText(t, Math.max(...tiers), maxTier),
            }))}
            icons={icons}
            columns={3}
            spreadLastRow
          />
        ) :
        <Empty text={t("skyblock.noMinions")} />}
    </Card>
  );
};

export const SkyBlockBestiaryProfile = ({ profile, t, ...card }: SkyBlockProfileProps) => {
  const bestiary = profile.member.bestiary!;

  const sidebar: SidebarItem[] = [
    [t("skyblock.milestone"), t(bestiary.milestone), "§c"],
    [t("skyblock.familyTiers"), `${t(bestiary.tiers)}§7/${t(bestiary.maxTiers)}`, "§e"],
    [t("skyblock.maxed"), `${t(bestiary.maxed)}§7/${t(bestiary.total)}`, "§6"],
  ];

  // Each page's progress, so the card stays one screen
  const pages = bestiary.pages.map(({ category, name, families }) => {
    const tiers = add(...families.map(({ tier }) => tier));
    const maxTiers = add(...families.map(({ maxTier }) => maxTier));
    const label = category && category !== name ? `${category}: ${name}` : name;
    return <Table.td title={label} value={progressText(t, tiers, maxTiers)} color="§f" size="small" />;
  });

  return (
    <Card {...card} name={profile.displayName} sidebar={sidebar}>
      <Table.table>{gridRows(pages, 3, true)}</Table.table>
    </Card>
  );
};
