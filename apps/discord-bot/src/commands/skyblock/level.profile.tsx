/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Card } from "./components/Card.js";
import { type SidebarItem, Table } from "#components";
import { Empty } from "./components/Empty.js";
import { ItemGrid, formatPriceAge } from "./components/ItemGrid.js";
import { LevelBar } from "./components/LevelBar.js";
import { prettify } from "@statsify/util";
import type { MemberView } from "@statsify/skyblock";
import type { SkyBlockProfileProps } from "./skyblock.command.js";

const SOURCES_SHOWN = 12;

const getTopSources = ({ level }: MemberView) =>
  level!.sources.slice(0, SOURCES_SHOWN);

export const getLevelIcons = (member: MemberView) =>
  getTopSources(member).map(({ texture }) => texture);

export const SkyBlockLevelProfile = ({
  profile,
  t,
  icons,
  ...card
}: SkyBlockProfileProps) => {
  const { level, pricesAsOf: asOf, market } = profile.member.level!;

  const sidebar: SidebarItem[] = [[t("skyblock.xp"), t(level.xp), "§3"]];

  const cheapest = getTopSources(profile.member).map(
    ({ name, xp, outsideBag, cost, coinsPerXp, texture }) => {
      let value = `§3${t("skyblock.xpGain", { xp: t(xp) })}`;
      if (outsideBag) value = `§3${t("skyblock.xpOnceInBag", { xp: t(xp) })}`;
      else if (cost && coinsPerXp !== undefined)
        value += ` §8• §6${t(Math.floor(cost.coins))} §7(${t("skyblock.perXp", { coins: t(Math.floor(coinsPerXp)) })})`;

      return { texture, name: `§f${name}`, value };
    },
  );

  const footnote = market
    ? formatPriceAge(t, asOf)
    : t("skyblock.noMarket", { mode: prettify(profile.gameMode) });

  return (
    <Card {...card} name={profile.displayName} sidebar={sidebar}>
      <Table.table>
        <Table.tr>
          <LevelBar
            title={t("skyblock.level")}
            level={level}
            color={profile.levelColor}
            t={t}
          />
        </Table.tr>
      </Table.table>
      {cheapest.length > 0 ? (
        <>
          <box width="100%">
            <text>{`§l${t(market ? "skyblock.cheapestXp" : "skyblock.mostXp")}`}</text>
          </box>
          <ItemGrid items={cheapest} icons={icons} />
        </>
      ) : (
        <Empty text={t("skyblock.noXpSources")} />
      )}
      <Empty text={footnote} />
    </Card>
  );
};
