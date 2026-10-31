/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Container, Footer, Header, type SidebarItem } from "#components";
import { EmptySection } from "./components/EmptySection.js";
import { ItemGrid, RARITY_COLORS, pricesAsOf } from "./components/ItemGrid.js";
import { prettify } from "@statsify/util";
import type { MemberView } from "@statsify/skyblock";
import type { SkyBlockProfileProps } from "./skyblock.command.js";

const MISSING_SHOWN = 12;

export const accessoryIcons = ({ accessories }: MemberView) =>
  accessories?.missing.slice(0, MISSING_SHOWN).map(({ texture }) => texture) ?? [];

export const SkyBlockAccessoriesProfile = ({
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
  const { accessories } = profile.member;

  if (!accessories) {
    return (
      <Container background={background}>
        <Header skin={skin} name={profile.displayName} badge={badge} title={title} time="LIVE" />
        <EmptySection setting="inventory" t={t} />
        <Footer logo={logo} user={user} />
      </Container>
    );
  }

  const sidebar: SidebarItem[] = [
    [t("skyblock.accessoryPower"), t(accessories.accessoryPower), "§d"],
    [t("skyblock.selectedPower"), accessories.selectedPower ? prettify(accessories.selectedPower) : t("skyblock.none"), "§e"],
    [t("skyblock.accessories"), t(accessories.active.length), "§a"],
    [t("skyblock.missing"), t(accessories.missing.length), "§c"],
  ];

  const missing = accessories.missing
    .slice(0, MISSING_SHOWN)
    .map(({ name, rarity, accessoryPower, outsideBag, cost, coinsPerAccessoryPower, texture }) => {
      const ap = t(accessoryPower);
      const price =
        cost && coinsPerAccessoryPower !== undefined ?
          `§6${t(Math.floor(cost.coins))} §7(${t("skyblock.perAp", { coins: t(Math.floor(coinsPerAccessoryPower)) })})` :
          `§c${t("skyblock.noBinListing")}`;

      let value = `§d${t("skyblock.apGain", { ap })} §8• ${price}`;
      if (outsideBag) value = `§d${t("skyblock.apOnceInBag", { ap })}`;
      else if (!accessories.market) value = `§d${t("skyblock.apGain", { ap })}`;

      return { texture, name: `${RARITY_COLORS[rarity]}${name}`, value };
    });

  const footnote = accessories.market ?
    pricesAsOf(t, accessories.pricesAsOf) :
    t("skyblock.noMarket", { mode: prettify(profile.gameMode) });

  return (
    <Container background={background}>
      <Header skin={skin} name={profile.displayName} badge={badge} sidebar={sidebar} title={title} time="LIVE" />
      {missing.length > 0 ?
        (
          <>
            <box width="100%">
              <text>{`§l${t(accessories.market ? "skyblock.cheapestAccessoryPower" : "skyblock.mostAccessoryPower")}`}</text>
            </box>
            <ItemGrid items={missing} icons={icons} />
          </>
        ) :
        (
          <box width="100%">
            <text>{`§a${t("skyblock.noMissingAccessories")}`}</text>
          </box>
        )}
      <box width="100%">
        <text>{`§7${footnote}`}</text>
      </box>
      <Footer logo={logo} user={user} />
    </Container>
  );
};
