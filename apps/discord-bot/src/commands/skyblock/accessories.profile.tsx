/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Container, Footer, Header, type SidebarItem } from "#components";
import { EmptySection } from "./components/EmptySection.js";
import { ItemGrid, pricesAsOf } from "./components/ItemGrid.js";
import { RARITY_COLORS } from "@statsify/skyblock/display";
import { StatLines } from "./components/StatLines.js";
import { prettify, removeFormatting } from "@statsify/util";
import type { InactiveAccessory, MemberView, MissingAccessory } from "@statsify/skyblock";
import type { SkyBlockProfileProps } from "./skyblock.command.js";

const MISSING_SHOWN = 12;
const INACTIVE_SHOWN = 12;

// Steps that rise in place have no price, so the cheapest-first list would bury them; they get a grid of their own
const topMissing = ({ accessories }: MemberView) =>
  accessories?.missing.filter(({ nextTier }) => !nextTier).slice(0, MISSING_SHOWN) ?? [];
const nextTierSteps = ({ accessories }: MemberView) => accessories?.missing.filter(({ nextTier }) => nextTier) ?? [];
const baseName = ({ name, reforge }: InactiveAccessory) => {
  const plain = removeFormatting(name);
  const prefix = reforge ? `${prettify(reforge)} ` : "";
  return prefix && plain.startsWith(prefix) ? plain.slice(prefix.length) : plain;
};

// One row per accessory, so a stack of duplicates doesn't fill the page. Copies with different names (Abicase colors)
// share the name they have in common, or the item's.
function topInactive({ accessories }: MemberView) {
  const copies = Map.groupBy(accessories?.inactive ?? [], (view) => view.id);

  return [...copies].slice(0, INACTIVE_SHOWN).map(([id, [first, ...rest]]) => {
    const bases = new Set([first, ...rest].map(baseName));
    const color = /^(?:§.)*/.exec(first.name)?.[0] ?? "";
    const name = rest.every((view) => view.name === first.name) ?
      first.name :
      `${color}${bases.size === 1 ? baseName(first) : prettify(id)}`;
    return { ...first, name, count: rest.length + 1 };
  });
}

export interface SkyBlockAccessoriesProfileProps extends SkyBlockProfileProps {
  page: "missing" | "inactive";
}

export const accessoryIcons = (page: SkyBlockAccessoriesProfileProps["page"]) => (member: MemberView) =>
  (page === "missing" ? [...nextTierSteps(member), ...topMissing(member)] : topInactive(member)).map(({ texture }) => texture);

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
  page,
}: SkyBlockAccessoriesProfileProps) => {
  const { accessories } = profile.member;

  if (!accessories) {
    return (
      <Container background={background}>
        <Header skin={skin} name={profile.displayName} badge={badge} title={title} time="LIVE" />
        <EmptySection setting="inventory" newProfile={profile.newProfile} empty={t("skyblock.noAccessories")} t={t} />
        <Footer logo={logo} user={user} />
      </Container>
    );
  }

  const sidebar: SidebarItem[] = [
    [t("skyblock.accessoryPower"), t(accessories.accessoryPower), "§d"],
    [t("skyblock.selectedPower"), accessories.selectedPower ? prettify(accessories.selectedPower) : t("skyblock.none"), "§e"],
    [t("skyblock.accessories"), `${t(accessories.unique)}§7/§a${t(accessories.chains)}`, "§a"],
    [t("skyblock.missing"), t(accessories.missing.filter(({ nextTier }) => !nextTier).length), "§c"],
    [t("skyblock.enrichments"), t(accessories.enrichments), "§b"],
    [t("skyblock.unenriched"), t(accessories.unenriched), "§c"],
    [t("skyblock.recombobulated"), t(accessories.recombobulated), "§d"],
    [
      t("skyblock.tuningPoints"),
      accessories.tuningTotal === undefined ?
        t(accessories.tuningPoints) :
        `${t(accessories.tuningPoints)}§7/§6${t(accessories.tuningTotal)}`,
      "§6",
    ],
  ];

  if (page === "inactive") {
    const inactive = topInactive(profile.member).map((view) => {
      const reason = view.reason === "duplicate" ? t("skyblock.duplicate") : t("skyblock.replacedBy", { name: view.replacedBy.name });
      return { texture: view.texture, name: view.name, value: `§7${reason}${view.count > 1 ? ` §8×${t(view.count)}` : ""}` };
    });

    return (
      <Container background={background}>
        <Header skin={skin} name={profile.displayName} badge={badge} sidebar={sidebar} title={title} time="LIVE" />
        {inactive.length > 0 ?
          <ItemGrid items={inactive} icons={icons} columns={1} /> :
          (
            <box width="100%">
              <text>{`§a${t("skyblock.noInactiveAccessories")}`}</text>
            </box>
          )}
        <Footer logo={logo} user={user} />
      </Container>
    );
  }

  const shown = topMissing(profile.member);
  // A price or the outside-bag note beside the name widens the card, so those values go under it
  const stacked = accessories.market || shown.some(({ outsideBag }) => outsideBag);

  const toEntry = (step: MissingAccessory) => {
    const { name, rarity, accessoryPower, outsideBag, cost, coinsPerAccessoryPower, texture, nextTier } = step;
    const ap = t(accessoryPower);
    const price =
      cost && coinsPerAccessoryPower !== undefined ?
        `§6${t(Math.floor(cost.coins))} §7(${t("skyblock.perAp", { coins: t(Math.floor(coinsPerAccessoryPower)) })})` :
        `§c${t("skyblock.noBinListing")}`;

    let value = `§d${t("skyblock.apGain", { ap })} §8• ${price}`;
    if (outsideBag) value = `§d${t("skyblock.apOnceInBag", { ap })}`;
    else if (nextTier) {
      const progress = t(`skyblock.tierProgress.${nextTier.unit}`, { has: t(nextTier.has), at: t(nextTier.at) });
      value = `§d${t("skyblock.apGain", { ap })} §8• §7${progress}`;
    } else if (!accessories.market) value = `§d${t("skyblock.apGain", { ap })}`;

    return { texture, name: `${RARITY_COLORS[rarity]}${name}`, value };
  };

  const missing = shown.map(toEntry);
  const nextTiers = nextTierSteps(profile.member).map(toEntry);

  const footnote = accessories.market ?
    pricesAsOf(t, accessories.pricesAsOf) :
    t("skyblock.noMarket", { mode: prettify(profile.gameMode) });

  return (
    <Container background={background}>
      <Header skin={skin} name={profile.displayName} badge={badge} sidebar={sidebar} title={title} time="LIVE" />
      {accessories.selectedPower && accessories.powerStats ?
        (
          <StatLines
            label={t("skyblock.powerStats", { power: prettify(accessories.selectedPower) })}
            stats={accessories.powerStats}
            t={t}
          />
        ) :
        <></>}
      {nextTiers.length > 0 ?
        (
          <>
            <box width="100%">
              <text>{`§l${t("skyblock.nextTiers")}`}</text>
            </box>
            <ItemGrid items={nextTiers} icons={icons} stacked spreadLastRow />
          </>
        ) :
        <></>}
      {missing.length > 0 ?
        (
          <>
            <box width="100%">
              <text>{`§l${t(accessories.market ? "skyblock.cheapestAccessoryPower" : "skyblock.mostAccessoryPower")}`}</text>
            </box>
            <ItemGrid items={missing} icons={icons} stacked={stacked} />
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
