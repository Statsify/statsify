/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Card, EmptyCard } from "./components/Card.js";
import type { SidebarItem } from "#components";
import { Empty } from "./components/Empty.js";
import { ItemGrid } from "./components/ItemGrid.js";
import { JACOB_MEDALS, MEDAL_COLORS } from "@statsify/skyblock/display";
import type { MemberView } from "@statsify/skyblock";
import { prettify } from "@statsify/util";
import type { SkyBlockProfileProps } from "./skyblock.command.js";

export const getJacobIcons = ({ jacob }: MemberView) =>
  jacob?.crops
    .map(({ texture }) => texture)
    .filter((texture) => texture !== undefined) ?? [];

export const SkyBlockJacobProfile = ({
  profile,
  t,
  icons,
  ...card
}: SkyBlockProfileProps) => {
  const jacob = profile.member.jacob;

  if (!jacob) {
    return (
      <EmptyCard
        {...card}
        name={profile.displayName}
        text={t("skyblock.noJacob")}
      />
    );
  }

  const sidebar: SidebarItem[] = [
    [t("skyblock.contests"), t(jacob.contests), "§e"],
    [t("skyblock.uniqueGolds"), t(jacob.uniqueGolds), MEDAL_COLORS.gold],
    ...JACOB_MEDALS.map(
      (medal): SidebarItem => [
        t(`skyblock.medals.${medal}`),
        t(jacob.medals[medal]),
        MEDAL_COLORS[medal],
      ],
    ),
    [
      t("skyblock.extraFarmingFortune"),
      `+${t(jacob.perks.farmingFortune)}`,
      "§a",
    ],
    [t("skyblock.farmingLevelCap"), `+${t(jacob.perks.farmingLevelCap)}`, "§a"],
  ];

  const items = jacob.crops.map(({ name, texture, bracket, personalBest }) => {
    const reached = bracket
      ? `${MEDAL_COLORS[bracket]}${prettify(bracket)}`
      : `§8${t("skyblock.none")}`;
    const best =
      personalBest === undefined
        ? ""
        : ` §8• §7${t("skyblock.personalBest", { amount: t(personalBest) })}`;

    return {
      texture,
      name: `${bracket ? MEDAL_COLORS[bracket] : "§7"}${name}`,
      value: `${reached}${best}`,
    };
  });

  return (
    <Card {...card} name={profile.displayName} sidebar={sidebar}>
      {items.length > 0 ? (
        <ItemGrid items={items} icons={icons} columns={2} spreadLastRow />
      ) : (
        <Empty text={t("skyblock.noJacobCrops")} />
      )}
    </Card>
  );
};
