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
import { arrayGroup, prettify, removeFormatting } from "@statsify/util";
import type { LocalizeFunction } from "@statsify/discord";
import type { InactiveAccessory, MemberView, PowerStat } from "@statsify/skyblock";
import type { SkyBlockProfileProps } from "./skyblock.command.js";

const MISSING_SHOWN = 12;
const INACTIVE_SHOWN = 12;
const MAX_POWER_STATS_PER_LINE = 3; // more is wider than the card

const topMissing = ({ accessories }: MemberView) => accessories?.missing.slice(0, MISSING_SHOWN) ?? [];
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
  (page === "missing" ? topMissing(member) : topInactive(member)).map(({ texture }) => texture);

const PowerStats = ({ power, stats, t }: { power: string; stats: PowerStat[]; t: LocalizeFunction }) => {
  const lineCount = Math.ceil(stats.length / MAX_POWER_STATS_PER_LINE);
  const lines = arrayGroup(
    stats.map(({ name, color, value }) => `${color}${value < 0 ? "" : "+"}${t(value)} ${name}`),
    Math.ceil(stats.length / lineCount)
  );

  return (
    <box width="100%" direction="column">
      {lines.map((line, index) => (
        <text>{`${index === 0 ? `§7${t("skyblock.powerStats", { power: prettify(power) })}: ` : ""}${line.join(" ")}`}</text>
      ))}
    </box>
  );
};

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
    [t("skyblock.accessories"), t(accessories.active.length), "§a"],
    [t("skyblock.missing"), t(accessories.missing.length), "§c"],
    [t("skyblock.enrichments"), t(accessories.enrichments), "§b"],
    [t("skyblock.tuningPoints"), t(accessories.tuningPoints), "§6"],
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

  const missing = shown.map(
    ({ name, rarity, accessoryPower, outsideBag, cost, coinsPerAccessoryPower, texture }) => {
      const ap = t(accessoryPower);
      const price =
        cost && coinsPerAccessoryPower !== undefined ?
          `§6${t(Math.floor(cost.coins))} §7(${t("skyblock.perAp", { coins: t(Math.floor(coinsPerAccessoryPower)) })})` :
          `§c${t("skyblock.noBinListing")}`;

      let value = `§d${t("skyblock.apGain", { ap })} §8• ${price}`;
      if (outsideBag) value = `§d${t("skyblock.apOnceInBag", { ap })}`;
      else if (!accessories.market) value = `§d${t("skyblock.apGain", { ap })}`;

      return { texture, name: `${RARITY_COLORS[rarity]}${name}`, value };
    }
  );

  const footnote = accessories.market ?
    pricesAsOf(t, accessories.pricesAsOf) :
    t("skyblock.noMarket", { mode: prettify(profile.gameMode) });

  return (
    <Container background={background}>
      <Header skin={skin} name={profile.displayName} badge={badge} sidebar={sidebar} title={title} time="LIVE" />
      {accessories.selectedPower && accessories.powerStats ?
        <PowerStats power={accessories.selectedPower} stats={accessories.powerStats} t={t} /> :
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
