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
import { JACOB_MEDALS, MEDAL_COLORS } from "@statsify/skyblock/display";
import type { MemberView } from "@statsify/skyblock";
import { prettify } from "@statsify/util";
import type { SkyBlockProfileProps } from "./skyblock.command.js";

export const jacobIcons = ({ jacob }: MemberView) =>
  jacob?.crops.flatMap(({ texture }) => (texture ? [texture] : [])) ?? [];

export const SkyBlockJacobProfile = ({
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
  const jacob = profile.member.jacob;

  if (!jacob) {
    return (
      <Container background={background}>
        <Header skin={skin} name={profile.displayName} badge={badge} title={title} time="LIVE" />
        <Empty text={t("skyblock.noJacob")} />
        <Footer logo={logo} user={user} />
      </Container>
    );
  }

  const sidebar: SidebarItem[] = [
    [t("skyblock.contests"), t(jacob.contests), "§e"],
    ...JACOB_MEDALS.map((medal): SidebarItem => [t(`skyblock.medals.${medal}`), t(jacob.medals[medal]), MEDAL_COLORS[medal]]),
    [t("skyblock.doubleDrops"), t(jacob.perks.doubleDrops), "§a"],
    [t("skyblock.farmingLevelCap"), `+${t(jacob.perks.farmingLevelCap)}`, "§a"],
  ];

  const items = jacob.crops.map(({ name, texture, bracket, personalBest }) => ({
    texture,
    name: `${bracket ? MEDAL_COLORS[bracket] : "§7"}${name}`,
    value: [
      bracket ? `${MEDAL_COLORS[bracket]}${prettify(bracket)}` : `§8${t("skyblock.none")}`,
      ...(personalBest === undefined ? [] : [`§7${t("skyblock.personalBest", { amount: t(personalBest) })}`]),
    ].join(" §8• "),
  }));

  return (
    <Container background={background}>
      <Header skin={skin} name={profile.displayName} badge={badge} sidebar={sidebar} title={title} time="LIVE" />
      {items.length > 0 ?
        <ItemGrid items={items} icons={icons} columns={2} spreadLastRow /> :
        <Empty text={t("skyblock.noJacobCrops")} />}
      <Footer logo={logo} user={user} />
    </Container>
  );
};
