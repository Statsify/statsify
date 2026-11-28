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
import { PLAYER_STATS, RARITY_COLORS } from "@statsify/skyblock/display";
import { StatLines } from "./components/StatLines.js";
import { prettify } from "@statsify/util";
import type { MemberView, PetView } from "@statsify/skyblock";
import type { SkyBlockProfileProps } from "./skyblock.command.js";

const PETS_SHOWN = 18;

// The section sorts the active pet first, then by rarity and XP
const topPets = ({ pets }: MemberView) => pets!.pets.slice(0, PETS_SHOWN);

// The game puts a ✦ in the skin's color after a skinned pet's name.
const formatPetName = ({ name, rarity, skinColor }: PetView) =>
  `${RARITY_COLORS[rarity]}${name}${skinColor ? `${skinColor} ✦` : ""}`;

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
  const { score, active, pets, totalXp, skinned, candyUsed, activeStats } =
    profile.member.pets!;

  const sidebar: SidebarItem[] = [
    [t("skyblock.petScore"), t(score), "§b"],
    [t("skyblock.pets"), t(pets.length), "§a"],
    [t("skyblock.skinnedPets"), t(skinned), "§d"],
    [t("skyblock.totalPetXp"), t(Math.floor(totalXp)), "§d"],
    [t("skyblock.petCandyUsed"), t(candyUsed), "§c"],
    [
      t("skyblock.activePet"),
      active ? formatPetName(active) : t("skyblock.none"),
      "§e",
    ],
  ];

  const stats = PLAYER_STATS.filter(({ id }) => activeStats?.[id]).map(
    ({ id, color }) => ({
      name: prettify(id),
      color,
      value: activeStats![id]!,
    }),
  );

  const items = topPets(profile.member).map((pet) => {
    const level = `§7${t("skyblock.petLevel", { level: t(pet.level.level) })}`;
    const candy = t("skyblock.candyUsed", { candy: t(pet.candyUsed) });

    return {
      texture: pet.texture,
      badge: pet.heldItemTexture,
      name: formatPetName(pet),
      value: pet.candyUsed > 0 ? `${level} §8• §c${candy}` : level,
    };
  });

  return (
    <Card {...card} name={profile.displayName} sidebar={sidebar}>
      {stats.length > 0 ? (
        <StatLines label={t("skyblock.activePet")} stats={stats} t={t} />
      ) : (
        <></>
      )}
      {items.length > 0 ? (
        <ItemGrid items={items} icons={icons} columns={3} stacked />
      ) : (
        <Empty text={t("skyblock.noPets")} />
      )}
    </Card>
  );
};
