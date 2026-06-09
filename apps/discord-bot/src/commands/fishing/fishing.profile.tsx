/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  Container,
  Footer,
  Header,
  Multiline,
  SidebarItem,
  Table,
} from "#components";
import { FISHING_EVENTS, FormattedGame } from "@statsify/schemas";
import { arrayGroup } from "@statsify/util";
import type { BaseProfileProps } from "#commands/base.hypixel-command";
import type {
  FishingCollectionItem,
  FishingEvent,
  FishingIndividualCatch,
  FishingSeasonalYear,
} from "@statsify/schemas";

export type FishingPage =
  | "overview"
  | "mythicals"
  | "specialsOne"
  | "specialsTwo"
  | "collections"
  | "catchesOne"
  | "catchesTwo"
  | "seasonal";

export interface FishingPageData {
  id: FishingPage;
  label: string;
  seasonalYears?: FishingSeasonalYear[];
}

interface FishingProfileProps extends BaseProfileProps {
  page: FishingPage;
  pageNumber: number;
  pageCount: number;
  seasonalYears?: FishingSeasonalYear[];
}

interface FishingCollectionTableProps {
  items: FishingCollectionItem[];
  columns?: number;
  compact?: boolean;
}

const statusColor = (unlocked: boolean) => (unlocked ? "§a" : "§c");

const FISHING_EVENT_COLORS: Record<FishingEvent, string> = {
  halloween: "§5",
  christmas: "§c",
  easter: "§b",
  summer: "§e",
};

const FISHING_EVENT_NAMES: Record<FishingEvent, string> = {
  halloween: "Halloween",
  christmas: "Holiday",
  easter: "Easter",
  summer: "Summer",
};

const FISHING_ENVIRONMENT_COLORS: Record<string, string> = {
  water: "§9",
  lava: "§c",
  ice: "§b",
};

const formatId = (id: string) =>
  id === "N/A"
    ? "N/A"
    : id
        .replace("mainlobby_fishing_", "")
        .replace("fishing_rod_", "")
        .replaceAll("_", " ")
        .replaceAll("-", " ")
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;

const formatFishingEnvironment = (environment: string) =>
  `${FISHING_ENVIRONMENT_COLORS[environment.toLowerCase()] ?? "§7"}${formatId(environment)}`;

const FishingCollectionTable = ({
  items,
  columns = 3,
  compact = false,
}: FishingCollectionTableProps) => (
  <Table.table>
    {arrayGroup(items, columns).map((row) => (
      <Table.tr>
        {row.map((item) => (
          <box
            width="100%"
            direction="column"
            padding={{ left: 8, right: 8, top: 4, bottom: 4 }}
          >
            <text>
              §l{statusColor(item.unlocked)}
              {item.active ? "§n" : ""}
              {item.name}
            </text>
            <text>
              {statusColor(item.unlocked)}
              {item.unlocked ? "Unlocked" : "Locked"}
              {compact
                ? ""
                : ` §7- ${item.source !== "N/A" ? item.source : item.requirement}`}
            </text>
            {!compact && item.environment !== "N/A" ? (
              <text>§7Found In: {formatFishingEnvironment(item.environment)}</text>
            ) : (
              <></>
            )}
          </box>
        ))}
      </Table.tr>
    ))}
  </Table.table>
);

const FishingOverview = ({
  t,
  player,
}: Pick<FishingProfileProps, "t" | "player">) => {
  const { fishing } = player.stats.general;

  return (
    <Table.table>
      <Table.ts title="§bLifetime Catches">
        <Table.tr>
          <Table.td title="Fish" value={t(fishing.fish)} color="§e" />
          <Table.td title="Junk" value={t(fishing.junk)} color="§c" />
          <Table.td title="Treasure" value={t(fishing.treasure)} color="§a" />
          <Table.td title="Plants" value={t(fishing.plant)} color="§2" />
          <Table.td title="Creatures" value={t(fishing.creature)} color="§b" />
          <Table.td title="Mythicals" value={t(fishing.mythical)} color="§6" />
        </Table.tr>
      </Table.ts>
      <Table.ts title="§bEnvironment Breakdown">
        <Table.tr>
          <Table.td
            title="Water Fish"
            value={t(fishing.water.fish)}
            color="§e"
          />
          <Table.td
            title="Water Junk"
            value={t(fishing.water.junk)}
            color="§c"
          />
          <Table.td
            title="Water Total"
            value={t(fishing.water.total)}
            color="§9"
          />
        </Table.tr>
        <Table.tr>
          <Table.td title="Lava Fish" value={t(fishing.lava.fish)} color="§e" />
          <Table.td title="Lava Junk" value={t(fishing.lava.junk)} color="§c" />
          <Table.td
            title="Lava Total"
            value={t(fishing.lava.total)}
            color="§c"
          />
        </Table.tr>
        <Table.tr>
          <Table.td title="Ice Fish" value={t(fishing.ice.fish)} color="§e" />
          <Table.td title="Ice Junk" value={t(fishing.ice.junk)} color="§c" />
          <Table.td title="Ice Total" value={t(fishing.ice.total)} color="§b" />
        </Table.tr>
      </Table.ts>
      <Table.ts title="§bRod Perks">
        <Table.tr>
          <Table.td
            title="Luck"
            value={`${t(fishing.enchants.luck.level)} ${fishing.enchants.luck.enabled ? "On" : "Off"}`}
            color="§e"
          />
          <Table.td
            title="Lure"
            value={`${t(fishing.enchants.lure.level)} ${fishing.enchants.lure.enabled ? "On" : "Off"}`}
            color="§e"
          />
          <Table.td
            title="Mythical Hook"
            value={`${t(fishing.enchants.mythicalHook.level)} ${fishing.enchants.mythicalHook.enabled ? "On" : "Off"}`}
            color="§d"
          />
        </Table.tr>
        <Table.tr>
          <Table.td
            title="Collector"
            value={`${t(fishing.enchants.collector.level)} ${fishing.enchants.collector.enabled ? "On" : "Off"}`}
            color="§a"
          />
          <Table.td
            title="Dumpster Diver"
            value={`${t(fishing.enchants.dumpsterDiver.level)} ${fishing.enchants.dumpsterDiver.enabled ? "On" : "Off"}`}
            color="§7"
          />
          <Table.td
            title="Vulcan's Blessing"
            value={`${t(fishing.enchants.vulcansBlessing.level)} ${fishing.enchants.vulcansBlessing.enabled ? "On" : "Off"}`}
            color="§c"
          />
        </Table.tr>
        <Table.tr>
          <Table.td
            title="Neptune's Fury"
            value={`${t(fishing.enchants.neptunesFury.level)} ${fishing.enchants.neptunesFury.enabled ? "On" : "Off"}`}
            color="§b"
          />
          <Table.td
            title="Herbivore"
            value={`${t(fishing.enchants.herbivore.level)} ${fishing.enchants.herbivore.enabled ? "On" : "Off"}`}
            color="§2"
          />
          <Table.td
            title="Land Line"
            value={`${t(fishing.enchants.landLine.level)} ${fishing.enchants.landLine.enabled ? "On" : "Off"}`}
            color="§6"
          />
        </Table.tr>
      </Table.ts>
      <Table.ts title="§bFireproofing">
        <Table.tr>
          <Table.td
            title="Scales"
            value={t(fishing.fireproofing.scales)}
            color="§e"
          />
          <Table.td
            title="Sealant"
            value={t(fishing.fireproofing.sealant)}
            color="§a"
          />
          <Table.td
            title="Flame"
            value={t(fishing.fireproofing.flame)}
            color="§c"
          />
        </Table.tr>
      </Table.ts>
    </Table.table>
  );
};

const FishingMythicals = ({
  t,
  player,
}: Pick<FishingProfileProps, "t" | "player">) => {
  const { fishing } = player.stats.general;

  return (
    <Table.table>
      {arrayGroup(fishing.mythicals, 3).map((row) => (
        <Table.tr>
          {row.map((mythical) => (
            <Table.ts title={`§d${mythical.name}`}>
              <box
                width="100%"
                direction="column"
                padding={{ left: 8, right: 8 }}
              >
                <Multiline>
                  {[
                    `§7Rarity: §b${mythical.rarity}`,
                    `§7Catches: §6${t(mythical.catches)}`,
                    `§7Share: §6${formatPercent(mythical.percentage)}`,
                    `§7Max Weight: §6${mythical.maxWeight ? `${t(mythical.maxWeight)}kg` : "N/A"}${mythical.maxed ? " §aMaxed" : ""}`,
                  ].join("\n")}
                </Multiline>
              </box>
            </Table.ts>
          ))}
        </Table.tr>
      ))}
    </Table.table>
  );
};

const FishingSpecials = ({
  player,
  page,
}: Pick<FishingProfileProps, "player" | "page">) => {
  const { fishing } = player.stats.general;
  const offset = page === "specialsOne" ? 0 : 24;

  return (
    <FishingCollectionTable
      items={fishing.specialFish.slice(offset, offset + 24)}
      columns={4}
    />
  );
};

const FishingCollections = ({
  player,
}: Pick<FishingProfileProps, "player">) => {
  const { fishing } = player.stats.general;

  return (
    <Table.table>
      <Table.ts title="§bFishing Rods">
        <FishingCollectionTable
          items={fishing.fishingRods}
          columns={2}
          compact={false}
        />
      </Table.ts>
      <Table.ts title="§bHook Trails">
        <FishingCollectionTable
          items={fishing.hookTrailCollection}
          columns={4}
          compact
        />
      </Table.ts>
    </Table.table>
  );
};

interface CatchSectionProps {
  title: string;
  items: FishingIndividualCatch[];
  color: string;
  columns: number;
  total: number;
  t: FishingProfileProps["t"];
}

const CatchSection = ({
  title,
  items,
  color,
  columns,
  total,
  t,
}: CatchSectionProps) => (
  <Table.ts title={`${title} §7- ${color}${t(total)}`}>
    {arrayGroup(items, columns).map((row) => (
      <Table.tr>
        {row.map((item) => (
          <Table.td
            title={item.name}
            value={t(item.catches)}
            color={color}
            size="inline"
          />
        ))}
      </Table.tr>
    ))}
  </Table.ts>
);

const FishingCatchesOne = ({
  t,
  player,
}: Pick<FishingProfileProps, "t" | "player">) => {
  const { fishing } = player.stats.general;
  const { individual } = fishing;

  return (
    <Table.table>
      <CatchSection
        title="§bFish"
        items={individual.fish}
        color="§e"
        columns={3}
        total={fishing.fish}
        t={t}
      />
      <CatchSection
        title="§bPlants"
        items={individual.plant}
        color="§2"
        columns={3}
        total={fishing.plant}
        t={t}
      />
      <CatchSection
        title="§bCreatures"
        items={individual.creature}
        color="§b"
        columns={3}
        total={fishing.creature}
        t={t}
      />
    </Table.table>
  );
};

const FishingCatchesTwo = ({
  t,
  player,
}: Pick<FishingProfileProps, "t" | "player">) => {
  const { fishing } = player.stats.general;
  const { individual } = fishing;

  return (
    <Table.table>
      <CatchSection
        title="§bTreasure"
        items={individual.treasure}
        color="§a"
        columns={3}
        total={fishing.treasure}
        t={t}
      />
      <CatchSection
        title="§bJunk"
        items={individual.junk}
        color="§c"
        columns={3}
        total={fishing.junk}
        t={t}
      />
    </Table.table>
  );
};

const seasonalSummary = (year: FishingSeasonalYear) => {
  const environments = FISHING_EVENTS.flatMap((event) => [
    year[event].water,
    year[event].lava,
    year[event].ice,
  ]);

  const events = FISHING_EVENTS.map((event) => year[event]);

  return {
    fish: environments.reduce(
      (total, environment) => total + environment.fish,
      0,
    ),
    junk: environments.reduce(
      (total, environment) => total + environment.junk,
      0,
    ),
    treasure: environments.reduce(
      (total, environment) => total + environment.treasure,
      0,
    ),
    mythical: environments.reduce(
      (total, environment) => total + environment.mythical,
      0,
    ),
    water: events.reduce((total, event) => total + event.water.total, 0),
    lava: events.reduce((total, event) => total + event.lava.total, 0),
    ice: events.reduce((total, event) => total + event.ice.total, 0),
    total: year.total,
  };
};

interface FishingSeasonalYearCardProps {
  year: FishingSeasonalYear;
  t: FishingProfileProps["t"];
}

const FishingSeasonalYearCard = ({ year, t }: FishingSeasonalYearCardProps) => {
  const summary = seasonalSummary(year);

  return (
    <Table.ts title={`§b§l${year.year} §r§7- §f${t(year.total)} §7catches`}>
      <Table.tr>
        {FISHING_EVENTS.map((event) => (
          <Table.td
            title={FISHING_EVENT_NAMES[event]}
            value={t(year[event].total)}
            color={FISHING_EVENT_COLORS[event]}
          />
        ))}
      </Table.tr>
      <Table.tr>
        <Table.td title="Water" value={t(summary.water)} color="§9" />
        <Table.td title="Lava" value={t(summary.lava)} color="§c" />
        <Table.td title="Ice" value={t(summary.ice)} color="§b" />
        <Table.td title="Mythicals" value={t(summary.mythical)} color="§6" />
      </Table.tr>
    </Table.ts>
  );
};

const FishingSeasonal = ({
  t,
  player,
  seasonalYears,
}: Pick<FishingProfileProps, "t" | "player" | "seasonalYears">) => {
  const { seasonal } = player.stats.general.fishing;
  const years =
    seasonalYears ?? seasonal.years.filter((year) => year.total > 0);

  if (years.length === 0) {
    return (
      <Table.table>
        <box width="100%" padding={{ top: 12, bottom: 12 }}>
          <text>§7No seasonal fishing data yet.</text>
        </box>
      </Table.table>
    );
  }

  return (
    <Table.table>
      {[
        <Table.ts title={`§bAll-Time Seasonal §7- §f${t(seasonal.total)}`}>
          <Table.tr>
            {FISHING_EVENTS.map((event) => (
              <Table.td
                title={FISHING_EVENT_NAMES[event]}
                value={t(seasonal[event])}
                color={FISHING_EVENT_COLORS[event]}
              />
            ))}
          </Table.tr>
        </Table.ts>,
        ...years.map((year) => <FishingSeasonalYearCard year={year} t={t} />),
      ]}
    </Table.table>
  );
};

export const FishingProfile = ({
  skin,
  player,
  background,
  logo,
  user,
  badge,
  t,
  time,
  page,
  pageNumber,
  pageCount,
  seasonalYears,
}: FishingProfileProps) => {
  const { fishing } = player.stats.general;

  const sidebar: SidebarItem[] = [
    ["Total Catches", t(fishing.totalCatches), "§b"],
    ["Mythicals", t(fishing.mythical), "§6"],
    ["Special Fish", `${t(fishing.special)}/48`, "§d"],
    ["Rods", `${t(fishing.rods)}/8`, "§a"],
    ["Hook Trails", `${t(fishing.hookTrails)}/11`, "§6"],
    ["Active Rod", formatId(fishing.activeFishingRod), "§a"],
    ["Active Trail", formatId(fishing.activeFishHookTrail), "§6"],
  ];

  const title =
    page === "overview"
      ? `§l${FormattedGame.FISHING} §fStats`
      : page === "mythicals"
        ? `§l${FormattedGame.FISHING} §fMythicals`
        : page === "specialsOne" || page === "specialsTwo"
          ? `§l${FormattedGame.FISHING} §fSpecial Fish`
          : page === "collections"
            ? `§l${FormattedGame.FISHING} §fCollections`
            : page === "catchesOne" || page === "catchesTwo"
              ? `§l${FormattedGame.FISHING} §fCatches`
              : `§l${FormattedGame.FISHING} §fSeasonal`;

  return (
    <Container background={background}>
      <Header
        skin={skin}
        name={player.prefixName}
        badge={badge}
        sidebar={sidebar}
        title={title}
        description={`§7Page ${t(pageNumber + 1)} / ${t(pageCount)}`}
        time={time}
      />
      {page === "overview" ? (
        <FishingOverview t={t} player={player} />
      ) : page === "mythicals" ? (
        <FishingMythicals t={t} player={player} />
      ) : page === "specialsOne" || page === "specialsTwo" ? (
        <FishingSpecials player={player} page={page} />
      ) : page === "collections" ? (
        <FishingCollections player={player} />
      ) : page === "catchesOne" ? (
        <FishingCatchesOne t={t} player={player} />
      ) : page === "catchesTwo" ? (
        <FishingCatchesTwo t={t} player={player} />
      ) : (
        <FishingSeasonal
          t={t}
          player={player}
          seasonalYears={seasonalYears}
        />
      )}
      <Footer logo={logo} user={user} />
    </Container>
  );
};
