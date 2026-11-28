/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Card } from "./components/Card.js";
import type { SidebarItem } from "#components";
import { Empty } from "./components/Empty.js";
import { ItemGrid } from "./components/ItemGrid.js";
import { RARITY_COLORS } from "@statsify/skyblock/display";
import type { MemberView } from "@statsify/skyblock";
import type { SkyBlockProfileProps } from "./skyblock.command.js";

const PETS_SHOWN = 18;

// The section sorts the active pet first, then by rarity and XP
const topPets = ({ pets }: MemberView) => pets!.pets.slice(0, PETS_SHOWN);

export const petIcons = (member: MemberView) =>
  topPets(member).flatMap(({ texture, heldItemTexture }) =>
    heldItemTexture ? [texture, heldItemTexture] : [texture],
  );

export const SkyBlockPetsProfile = ({
  profile,
  t,
  icons,
  ...card
}: SkyBlockProfileProps) => {
  const { score, active, pets, totalXp } = profile.member.pets!;

  const sidebar: SidebarItem[] = [
    [t("skyblock.petScore"), t(score), "§b"],
    [t("skyblock.pets"), t(pets.length), "§a"],
    [t("skyblock.totalPetXp"), t(Math.floor(totalXp)), "§d"],
    [
      t("skyblock.activePet"),
      active
        ? `${RARITY_COLORS[active.rarity]}${active.name}`
        : t("skyblock.none"),
      "§e",
    ],
  ];

  const items = topPets(profile.member).map((pet) => {
    const level = `§7${t("skyblock.petLevel", { level: t(pet.level.level) })}`;
    const candy = t("skyblock.candyUsed", { candy: t(pet.candyUsed) });

    return {
      texture: pet.texture,
      badge: pet.heldItemTexture,
      name: `${RARITY_COLORS[pet.rarity]}${pet.name}`,
      value: pet.candyUsed > 0 ? `${level} §8• §c${candy}` : level,
    };
  });

  return (
    <Card {...card} name={profile.displayName} sidebar={sidebar}>
      {items.length > 0 ? (
        <ItemGrid items={items} icons={icons} columns={3} />
      ) : (
        <Empty text={t("skyblock.noPets")} />
      )}
    </Card>
  );
};
