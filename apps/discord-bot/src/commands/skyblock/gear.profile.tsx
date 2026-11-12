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
import { prettify } from "@statsify/util";
import type { ItemView, MemberView, Slots } from "@statsify/skyblock";
import type { SkyBlockProfileProps } from "./skyblock.command.js";

const WEAPONS = 4;

const filled = (slots: Slots) => slots.filter((item): item is ItemView => item !== null);

export const gearIcons = ({ gear }: MemberView) =>
  gear ? [...filled(gear.armor), ...filled(gear.equipment), ...gear.weapons.slice(0, WEAPONS)].map(({ texture }) => texture) : [];

export const SkyBlockGearProfile = ({
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
  const { gear } = profile.member;

  const sidebar: SidebarItem[] = gear ?
    [
      [t("skyblock.wardrobeSets"), t(gear.wardrobe.length), "§b"],
      [t("skyblock.equipmentSets"), t(gear.equipmentSets.length), "§b"],
      [t("skyblock.weapons"), t(gear.weapons.length), "§c"],
    ] :
    [];

  // Armor, then equipment, then the first weapons, each kind starting a row
  const items = gear ?
    [filled(gear.armor), filled(gear.equipment), gear.weapons.slice(0, WEAPONS)].flatMap((kind) =>
      kind.length % 2 === 0 ? kind : [...kind, undefined]
    ) :
    [];

  return (
    <Container background={background}>
      <Header skin={skin} name={profile.displayName} badge={badge} sidebar={sidebar} title={title} time="LIVE" />
      {gear ?
        (
          <ItemGrid
            items={items.map((item) => (item ? { texture: item.texture, name: item.name, value: "" } : { name: "", value: "" }))}
            icons={icons}
            columns={2}
          />
        ) :
        <EmptySection setting="inventory" newProfile={profile.newProfile} empty={t("skyblock.noGear")} t={t} />}
      <Footer logo={logo} user={user} />
    </Container>
  );
};

export const SkyBlockMuseumProfile = ({
  profile,
  title,
  skin,
  badge,
  background,
  logo,
  user,
  t,
}: SkyBlockProfileProps) => {
  const { museum } = profile.member;

  if (!museum) {
    return (
      <Container background={background}>
        <Header skin={skin} name={profile.displayName} badge={badge} title={title} time="LIVE" />
        <Empty text={t("skyblock.noMuseum")} />
        <Footer logo={logo} user={user} />
      </Container>
    );
  }

  const sidebar: SidebarItem[] = [
    [t("skyblock.museumValue"), t(Math.floor(museum.value)), "§6"],
    [t("skyblock.itemsDonated"), t(museum.items.length), "§a"],
    [t("skyblock.specialItems"), t(museum.special.length), "§d"],
    [t("skyblock.appraised"), t(museum.appraisal ? "skyblock.yes" : "skyblock.no"), museum.appraisal ? "§a" : "§c"],
  ];

  const categories = museum.donated.map(({ category, count }) => (
    <Table.td title={prettify(category)} value={t(count)} color="§a" size="small" />
  ));

  return (
    <Container background={background}>
      <Header skin={skin} name={profile.displayName} badge={badge} sidebar={sidebar} title={title} time="LIVE" />
      <Table.table>{gridRows(categories, 3)}</Table.table>
      <Footer logo={logo} user={user} />
    </Container>
  );
};
