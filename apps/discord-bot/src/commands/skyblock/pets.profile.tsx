/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Container, Footer, Header, type SidebarItem } from "#components";
import { Empty } from "./components/Empty.js";
import { ItemGrid, RARITY_COLORS } from "./components/ItemGrid.js";
import type { MemberView } from "@statsify/skyblock";
import type { SkyBlockProfileProps } from "./skyblock.command.js";

const PETS_SHOWN = 18;

// The section sorts the active pet first, then by rarity and XP
const topPets = ({ pets }: MemberView) => pets!.pets.slice(0, PETS_SHOWN);

export const petIcons = (member: MemberView) =>
  topPets(member).flatMap(({ texture, heldItemTexture }) => (heldItemTexture ? [texture, heldItemTexture] : [texture]));

export const SkyBlockPetsProfile = ({
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
  const { score, active, pets, totalXp } = profile.member.pets!;

  const sidebar: SidebarItem[] = [
    [t("skyblock.petScore"), t(score), "§b"],
    [t("skyblock.pets"), t(pets.length), "§a"],
    [t("skyblock.totalPetXp"), t(Math.floor(totalXp)), "§d"],
    [t("skyblock.activePet"), active ? `${RARITY_COLORS[active.rarity]}${active.name}` : t("skyblock.none"), "§e"],
  ];

  const items = topPets(profile.member).map(({ name, rarity, level, texture, heldItemTexture, candyUsed }) => {
    const candy = candyUsed > 0 ? ` §8• §c${t("skyblock.candyUsed", { candy: t(candyUsed) })}` : "";
    return {
      texture,
      badge: heldItemTexture,
      name: `${RARITY_COLORS[rarity]}${name}`,
      value: `§7${t("skyblock.petLevel", { level: t(level.level) })}${candy}`,
    };
  });

  return (
    <Container background={background}>
      <Header skin={skin} name={profile.displayName} badge={badge} sidebar={sidebar} title={title} time="LIVE" />
      {items.length > 0 ?
        <ItemGrid items={items} icons={icons} columns={3} /> :
        <Empty text={t("skyblock.noPets")} />}
      <Footer logo={logo} user={user} />
    </Container>
  );
};
