/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Container, Footer, Header, type SidebarItem } from "#components";
import { Empty } from "./components/Empty.js";
import { ItemGrid } from "./components/ItemGrid.js";
import { PLAYER_STATS, RARITY_COLORS } from "@statsify/skyblock/display";
import { StatLines } from "./components/StatLines.js";
import { prettify } from "@statsify/util";
import type { MemberView, PetView } from "@statsify/skyblock";
import type { SkyBlockProfileProps } from "./skyblock.command.js";

const PETS_SHOWN = 18;

// The section sorts the active pet first, then by rarity and XP
const topPets = ({ pets }: MemberView) => pets!.pets.slice(0, PETS_SHOWN);

const petName = ({ name, rarity, skinColor }: PetView) =>
  `${RARITY_COLORS[rarity]}${name}${skinColor ? `${skinColor} ✦` : ""}`;

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
  const { score, active, pets, totalXp, skinned, candyUsed, activeStats } = profile.member.pets!;

  const sidebar: SidebarItem[] = [
    [t("skyblock.petScore"), t(score), "§b"],
    [t("skyblock.pets"), t(pets.length), "§a"],
    [t("skyblock.skinnedPets"), t(skinned), "§d"],
    [t("skyblock.totalPetXp"), t(Math.floor(totalXp)), "§d"],
    [t("skyblock.petCandyUsed"), t(candyUsed), "§c"],
    [t("skyblock.activePet"), active ? petName(active) : t("skyblock.none"), "§e"],
  ];

  const stats = PLAYER_STATS.flatMap(({ id, color }) => {
    const value = activeStats?.[id];
    return value ? [{ name: prettify(id), color, value }] : [];
  });

  const items = topPets(profile.member).map((pet) => {
    const candy = pet.candyUsed > 0 ? ` §8• §c${t("skyblock.candyUsed", { candy: t(pet.candyUsed) })}` : "";
    return {
      texture: pet.texture,
      badge: pet.heldItemTexture,
      name: petName(pet),
      value: `§7${t("skyblock.petLevel", { level: t(pet.level.level) })}${candy}`,
    };
  });

  return (
    <Container background={background}>
      <Header skin={skin} name={profile.displayName} badge={badge} sidebar={sidebar} title={title} time="LIVE" />
      {stats.length > 0 ? <StatLines label={t("skyblock.activePet")} stats={stats} t={t} /> : <></>}
      {items.length > 0 ?
        <ItemGrid items={items} icons={icons} columns={3} stacked /> :
        <Empty text={t("skyblock.noPets")} />}
      <Footer logo={logo} user={user} />
    </Container>
  );
};
