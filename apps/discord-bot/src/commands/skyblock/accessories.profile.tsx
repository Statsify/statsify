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
import { EmptySection } from "./components/EmptySection.js";
import {
  ItemGrid,
  formatFraction,
  formatPriceAge,
} from "./components/ItemGrid.js";
import { RARITY_COLORS } from "@statsify/skyblock/display";
import { StatLines } from "./components/StatLines.js";
import { prettify, removeFormatting } from "@statsify/util";
import type {
  InactiveAccessory,
  MemberView,
  MissingAccessory,
} from "@statsify/skyblock";
import type { SkyBlockProfileProps } from "./skyblock.command.js";

const MISSING_SHOWN = 12;
const INACTIVE_SHOWN = 12;

// In-place steps have no price, so they get a grid of their own.
const getTopMissing = ({ accessories }: MemberView) =>
  accessories?.missing
    .filter(({ nextTier }) => !nextTier)
    .slice(0, MISSING_SHOWN) ?? [];

const getNextTiers = ({ accessories }: MemberView) =>
  accessories?.missing.filter(({ nextTier }) => nextTier) ?? [];

function getBaseName({ name, reforge }: InactiveAccessory) {
  const plain = removeFormatting(name);
  const prefix = reforge ? `${prettify(reforge)} ` : "";
  if (prefix && plain.startsWith(prefix)) return plain.slice(prefix.length);
  return plain;
}

// Abicase colors share an id, so copies show the name they have in common.
function getSharedName(id: string, copies: InactiveAccessory[]) {
  const [first] = copies;
  if (copies.every((view) => view.name === first.name)) return first.name;

  const color = /^(?:§.)*/.exec(first.name)?.[0] ?? "";
  const bases = new Set(copies.map(getBaseName));
  const name = bases.size === 1 ? getBaseName(first) : prettify(id);
  return `${color}${name}`;
}

function topInactive({ accessories }: MemberView) {
  const copies = Map.groupBy(accessories?.inactive ?? [], (view) => view.id);

  return [...copies].slice(0, INACTIVE_SHOWN).map(([id, views]) => ({
    ...views[0],
    name: getSharedName(id, views),
    count: views.length,
  }));
}

interface SkyBlockAccessoriesProfileProps extends SkyBlockProfileProps {
  page: "missing" | "inactive";
}

export const getAccessoryIcons =
  (page: SkyBlockAccessoriesProfileProps["page"]) => (member: MemberView) => {
    const shown =
      page === "missing"
        ? [...getNextTiers(member), ...getTopMissing(member)]
        : topInactive(member);
    return shown.map(({ texture }) => texture);
  };

export const SkyBlockAccessoriesProfile = ({
  profile,
  t,
  icons,
  page,
  ...card
}: SkyBlockAccessoriesProfileProps) => {
  const { accessories } = profile.member;

  if (!accessories) {
    return (
      <Card {...card} name={profile.displayName}>
        <EmptySection
          setting="inventory"
          newProfile={profile.newProfile}
          empty={t("skyblock.noAccessories")}
          t={t}
        />
      </Card>
    );
  }

  const sidebar: SidebarItem[] = [
    [t("skyblock.accessoryPower"), t(accessories.accessoryPower), "§d"],
    [
      t("skyblock.selectedPower"),
      accessories.selectedPower
        ? prettify(accessories.selectedPower)
        : t("skyblock.none"),
      "§e",
    ],
    [
      t("skyblock.accessories"),
      formatFraction(t, accessories.unique, accessories.chains, "§a"),
      "§a",
    ],
    [
      t("skyblock.missing"),
      t(accessories.missing.filter(({ nextTier }) => !nextTier).length),
      "§c",
    ],
    [t("skyblock.enrichments"), t(accessories.enrichments), "§b"],
    [t("skyblock.unenriched"), t(accessories.unenriched), "§c"],
    [t("skyblock.recombobulated"), t(accessories.recombobulated), "§d"],
    [
      t("skyblock.tuningPoints"),
      accessories.tuningTotal === undefined
        ? t(accessories.tuningPoints)
        : `${t(accessories.tuningPoints)}§7/§6${t(accessories.tuningTotal)}`,
      "§6",
    ],
  ];

  if (page === "inactive") {
    const inactive = topInactive(profile.member).map((view) => {
      const reason =
        view.reason === "duplicate"
          ? t("skyblock.duplicate")
          : t("skyblock.replacedBy", { name: view.replacedBy.name });
      const count = view.count > 1 ? ` §8×${t(view.count)}` : "";
      return {
        texture: view.texture,
        name: view.name,
        value: `§7${reason}${count}`,
      };
    });

    return (
      <Card {...card} name={profile.displayName} sidebar={sidebar}>
        {inactive.length > 0 ? (
          <ItemGrid items={inactive} icons={icons} columns={1} />
        ) : (
          <Empty text={t("skyblock.noInactiveAccessories")} color="§a" />
        )}
      </Card>
    );
  }

  const shown = getTopMissing(profile.member);
  // A price or the outside-bag note would widen the card beside the name.
  const stacked =
    accessories.market || shown.some(({ outsideBag }) => outsideBag);

  const toEntry = (step: MissingAccessory) => {
    const { name, rarity, accessoryPower, cost, coinsPerAccessoryPower } = step;
    const ap = t(accessoryPower);
    const gain = `§d${t("skyblock.apGain", { ap })}`;
    const price =
      cost && coinsPerAccessoryPower !== undefined
        ? `§6${t(Math.floor(cost.coins))} §7(${t("skyblock.perAp", { coins: t(Math.floor(coinsPerAccessoryPower)) })})`
        : `§c${t("skyblock.noBinListing")}`;

    let value = `${gain} §8• ${price}`;
    if (step.outsideBag) {
      value = `§d${t("skyblock.apOnceInBag", { ap })}`;
    } else if (step.nextTier) {
      const { unit, has, at } = step.nextTier;
      const progress = t(`skyblock.tierProgress.${unit}`, {
        has: t(has),
        at: t(at),
      });
      value = `${gain} §8• §7${progress}`;
    } else if (!accessories.market) {
      value = gain;
    }

    const shownName = `${RARITY_COLORS[rarity]}${name}`;
    return { texture: step.texture, name: shownName, value };
  };

  const missing = shown.map(toEntry);
  const nextTiers = getNextTiers(profile.member).map(toEntry);

  const footnote = accessories.market
    ? formatPriceAge(t, accessories.pricesAsOf)
    : t("skyblock.noMarket", { mode: prettify(profile.gameMode) });

  return (
    <Card {...card} name={profile.displayName} sidebar={sidebar}>
      {accessories.selectedPower && accessories.powerStats ? (
        <StatLines
          label={t("skyblock.powerStats", {
            power: prettify(accessories.selectedPower),
          })}
          stats={accessories.powerStats}
          t={t}
        />
      ) : (
        <></>
      )}
      {nextTiers.length > 0 ? (
        <>
          <box width="100%">
            <text>{`§l${t("skyblock.nextTiers")}`}</text>
          </box>
          <ItemGrid items={nextTiers} icons={icons} stacked spreadLastRow />
        </>
      ) : (
        <></>
      )}
      {missing.length > 0 ? (
        <>
          <box width="100%">
            <text>{`§l${t(accessories.market ? "skyblock.cheapestAccessoryPower" : "skyblock.mostAccessoryPower")}`}</text>
          </box>
          <ItemGrid items={missing} icons={icons} stacked={stacked} />
        </>
      ) : (
        <Empty text={t("skyblock.noMissingAccessories")} color="§a" />
      )}
      <Empty text={footnote} />
    </Card>
  );
};
