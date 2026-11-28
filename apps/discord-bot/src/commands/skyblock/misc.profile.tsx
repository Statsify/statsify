/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { AUCTION_STATS, RIFT_TOTALS } from "@statsify/skyblock/display";
import { Card } from "./components/Card.js";
import { type SidebarItem, Table } from "#components";
import { Empty } from "./components/Empty.js";
import { ItemGrid, gridRows, formatProgress } from "./components/ItemGrid.js";
import { add } from "@statsify/math";
import { formatTime } from "@statsify/util";
import type { MemberView } from "@statsify/skyblock";
import type { SkyBlockProfileProps } from "./skyblock.command.js";

const TOP = 9;

export const consumableIcons = ({ misc }: MemberView) =>
  misc?.consumables.flatMap(({ texture }) => (texture ? [texture] : [])) ?? [];

export const SkyBlockMiscProfile = ({
  profile,
  t,
  icons,
  ...card
}: SkyBlockProfileProps) => {
  const misc = profile.member.misc!;
  const none = t("skyblock.none");

  const sidebar: SidebarItem[] = [
    [t("stats.kills"), t(misc.kills), "§a"],
    [t("stats.deaths"), t(misc.deaths), "§c"],
    [
      t("skyblock.highestDamage"),
      misc.highestCriticalDamage
        ? t(Math.floor(misc.highestCriticalDamage))
        : none,
      "§6",
    ],
    [t("skyblock.giftsGiven"), t(misc.gifts.given), "§d"],
  ];

  const top = (list: { name: string; count: number }[], color: string) =>
    list
      .slice(0, TOP)
      .map(({ name, count }) => (
        <Table.td title={name} value={t(count)} color={color} size="small" />
      ));

  const auctions = AUCTION_STATS.map((stat) => (
    <Table.td
      title={t(`skyblock.auctionStats.${stat}`)}
      value={t(Math.floor(misc.auctions[stat]))}
      color="§6"
      size="small"
    />
  ));

  const { dragons } = misc;
  const dragonCells = [
    <Table.td
      title={t("skyblock.dragonsSummoned")}
      value={t(dragons.summoned)}
      color="§5"
      size="small"
    />,
    <Table.td
      title={t("skyblock.eyesPlaced")}
      value={t(dragons.eyesPlaced)}
      color="§5"
      size="small"
    />,
    <Table.td
      title={t("skyblock.fastestKill")}
      value={dragons.fastestKill ? formatTime(dragons.fastestKill) : none}
      color="§5"
      size="small"
    />,
    <Table.td
      title={t("skyblock.mostDamage")}
      value={dragons.mostDamage ? t(Math.floor(dragons.mostDamage)) : none}
      color="§5"
      size="small"
    />,
  ];

  return (
    <Card {...card} name={profile.displayName} sidebar={sidebar}>
      <Table.table>
        <Table.ts title={`§a${t("skyblock.topKills")}`}>
          {gridRows(top(misc.topKills, "§a"), 3, { spreadLastRow: true })}
        </Table.ts>
        <Table.ts title={`§c${t("skyblock.topDeaths")}`}>
          {gridRows(top(misc.topDeaths, "§c"), 3, { spreadLastRow: true })}
        </Table.ts>
        <Table.ts title={`§6${t("skyblock.auctionHouse")}`}>
          {gridRows(auctions, 4)}
        </Table.ts>
        <Table.ts title={`§5${t("skyblock.dragons")}`}>
          {gridRows(dragonCells, 4)}
        </Table.ts>
      </Table.table>
      {misc.consumables.length > 0 ? (
        <ItemGrid
          items={misc.consumables.map(({ texture, name, used, max }) => ({
            texture,
            name: `§f${name}`,
            value: formatProgress(t, used, max),
          }))}
          icons={icons}
          columns={2}
          spreadLastRow
        />
      ) : (
        <></>
      )}
    </Card>
  );
};

export const SkyBlockRiftProfile = ({
  profile,
  t,
  ...card
}: SkyBlockProfileProps) => {
  const rift = profile.member.rift;

  return (
    <Card {...card} name={profile.displayName}>
      {rift ? (
        <Table.table>
          <Table.tr>
            <Table.td
              title={t("skyblock.motes")}
              value={t(Math.floor(rift.motes))}
              color="§d"
            />
            <Table.td
              title={t("skyblock.lifetimeMotes")}
              value={t(Math.floor(rift.lifetimeMotes))}
              color="§d"
            />
            <Table.td
              title={t("skyblock.visits")}
              value={t(rift.visits)}
              color="§a"
            />
          </Table.tr>
          <Table.tr>
            <Table.td
              title={t("skyblock.enigmaSouls")}
              value={formatProgress(
                t,
                rift.enigmaSouls,
                RIFT_TOTALS.enigmaSouls,
              )}
              color="§5"
            />
            <Table.td
              title={t("skyblock.timecharms")}
              value={formatProgress(t, rift.timecharms, RIFT_TOTALS.timecharms)}
              color="§a"
            />
            <Table.td
              title={t("skyblock.catsFound")}
              value={formatProgress(t, rift.catsFound, RIFT_TOTALS.catsFound)}
              color="§6"
            />
          </Table.tr>
        </Table.table>
      ) : (
        <Empty text={t("skyblock.noRift")} />
      )}
    </Card>
  );
};

export const SkyBlockExperimentsProfile = ({
  profile,
  t,
  ...card
}: SkyBlockProfileProps) => {
  const experiments = profile.member.experiments;
  const sidebar: SidebarItem[] = experiments
    ? [[t("skyblock.serumsDrunk"), t(experiments.serums), "§d"]]
    : [];

  const games = (experiments?.games ?? []).map(
    ({ game, bonusClicks, tiers }) => (
      <Table.ts title={`§b${t(`skyblock.experiments.${game}`)}`}>
        <Table.tr>
          <Table.td
            title={t("skyblock.claims")}
            value={t(add(...tiers.map(({ claims }) => claims)))}
            color="§a"
            size="small"
          />
          <Table.td
            title={t("skyblock.bestScore")}
            value={t(
              Math.max(0, ...tiers.map(({ bestScore }) => bestScore ?? 0)),
            )}
            color="§e"
            size="small"
          />
          <Table.td
            title={t("skyblock.bonusClicks")}
            value={t(bonusClicks)}
            color="§d"
            size="small"
          />
        </Table.tr>
      </Table.ts>
    ),
  );

  return (
    <Card {...card} name={profile.displayName} sidebar={sidebar}>
      {games.length > 0 ? (
        <Table.table>{games}</Table.table>
      ) : (
        <Empty text={t("skyblock.noExperiments")} />
      )}
    </Card>
  );
};
