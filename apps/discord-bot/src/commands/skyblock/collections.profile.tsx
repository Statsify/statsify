/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Container, Footer, Header, type SidebarItem, Table } from "#components";
import { Empty } from "./components/Empty.js";
import { EmptySection } from "./components/EmptySection.js";
import { ItemGrid, gridRows } from "./components/ItemGrid.js";
import { add } from "@statsify/math";
import type { CollectionCategory, MemberView } from "@statsify/skyblock";
import type { LocalizeFunction } from "@statsify/discord";
import type { SkyBlockProfileProps } from "./skyblock.command.js";

const tierText = (t: LocalizeFunction, tier: number, maxTier: number) =>
  `${tier === maxTier ? "§6" : "§e"}${t(tier)}§7/${t(maxTier)}`;

export const collectionIcons = (category: CollectionCategory) => ({ collections }: MemberView) =>
  collections?.categories.find(({ id }) => id === category)?.items.flatMap(({ texture }) => (texture ? [texture] : [])) ?? [];

export const minionIcons = ({ minions }: MemberView) => minions?.minions.flatMap(({ texture }) => (texture ? [texture] : [])) ?? [];

export interface SkyBlockCollectionsProfileProps extends SkyBlockProfileProps {
  category: CollectionCategory;
}

export const SkyBlockCollectionsProfile = ({
  profile,
  title,
  skin,
  badge,
  background,
  logo,
  user,
  t,
  icons,
  category,
}: SkyBlockCollectionsProfileProps) => {
  const { collections } = profile.member;
  const items = collections?.categories.find(({ id }) => id === category)?.items ?? [];

  const sidebar: SidebarItem[] = collections ?
    [
      [t("skyblock.maxed"), `${t(collections.maxed)}§7/${t(collections.total)}`, "§6"],
      [t("skyblock.bossCollections"), t(collections.bosses.filter(({ amount }) => amount > 0).length), "§c"],
    ] :
    [];

  return (
    <Container background={background}>
      <Header skin={skin} name={profile.displayName} badge={badge} sidebar={sidebar} title={title} time="LIVE" />
      {collections ?
        (
          <ItemGrid
            items={items.map(({ texture, name, amount, tier, maxTier }) => ({
              texture,
              name: `§f${name}`,
              value: `§b${t(amount)} ${tierText(t, tier, maxTier)}`,
            }))}
            icons={icons}
            columns={3}
            stacked
          />
        ) :
        <EmptySection setting="collections" newProfile={profile.newProfile} empty={t("skyblock.noCollections")} t={t} />}
      <Footer logo={logo} user={user} />
    </Container>
  );
};

export const SkyBlockMinionsProfile = ({
  profile,
  title,
  skin,
  badge,
  background,
  logo,
  user,
  t,
  icons,
}: SkyBlockProfileProps) => {
  const minions = profile.member.minions!;
  const crafted = minions.minions.filter(({ tiers }) => tiers.length > 0);

  const sidebar: SidebarItem[] = [
    [t("skyblock.uniqueCrafts"), t(minions.unique), "§a"],
    [t("skyblock.minionSlots"), t(minions.slots.total), "§e"],
    ...(minions.slots.next === undefined ?
      [] :
      [[t("skyblock.nextSlot"), t("skyblock.craftsToGo", { count: minions.slots.next - minions.slots.crafts }), "§7"] as SidebarItem]),
  ];

  return (
    <Container background={background}>
      <Header skin={skin} name={profile.displayName} badge={badge} sidebar={sidebar} title={title} time="LIVE" />
      {crafted.length > 0 ?
        (
          <ItemGrid
            items={crafted.map(({ texture, name, tiers, maxTier }) => ({
              texture,
              name: `§f${name.replace(/ Minion$/, "")}`,
              value: tierText(t, Math.max(...tiers), maxTier),
            }))}
            icons={icons}
            columns={4}
          />
        ) :
        <Empty text={t("skyblock.noMinions")} />}
      <Footer logo={logo} user={user} />
    </Container>
  );
};

export const SkyBlockBestiaryProfile = ({
  profile,
  title,
  skin,
  badge,
  background,
  logo,
  user,
  t,
}: SkyBlockProfileProps) => {
  const bestiary = profile.member.bestiary!;

  const sidebar: SidebarItem[] = [
    [t("skyblock.milestone"), t(bestiary.milestone), "§c"],
    [t("skyblock.familyTiers"), `${t(bestiary.tiers)}§7/${t(bestiary.maxTiers)}`, "§e"],
    [t("skyblock.maxed"), `${t(bestiary.maxed)}§7/${t(bestiary.total)}`, "§6"],
  ];

  // Each page's progress, so the card stays one screen; the families are on the site
  const pages = bestiary.pages.map(({ category, name, families }) => {
    const tiers = add(...families.map(({ tier }) => tier));
    const maxTiers = add(...families.map(({ maxTier }) => maxTier));
    const label = category && category !== name ? `${category}: ${name}` : name;
    return <Table.td title={label} value={tierText(t, tiers, maxTiers)} color="§f" size="small" />;
  });

  return (
    <Container background={background}>
      <Header skin={skin} name={profile.displayName} badge={badge} sidebar={sidebar} title={title} time="LIVE" />
      <Table.table>{gridRows(pages, 3)}</Table.table>
      <Footer logo={logo} user={user} />
    </Container>
  );
};
