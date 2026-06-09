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
import {
  FISHING_EVENTS,
  FISHING_HOOK_TRAILS,
  FISHING_INDIVIDUAL_ITEMS,
  FISHING_MYTHICAL_FISH,
  FISHING_RODS,
  FISHING_SPECIAL_FISH,
  type FishingEnvironmentStats,
  type FishingEvent,
  type FishingIndividualCatch,
  type FishingSeasonalYear,
  FormattedGame,
} from "@statsify/schemas";
import { arrayGroup, prettify } from "@statsify/util";
import type { BaseProfileProps } from "#commands/base.hypixel-command";

export type FishingPage =
  | "overview" |
  "mythicals" |
  "specialsOne" |
  "specialsTwo" |
  "collections" |
  "catchesOne" |
  "catchesTwo" |
  "environments" |
  "seasonal" |
  "yearly";

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
  items: FishingCollectionDisplayItem[];
  columns?: number;
  compact?: boolean;
}

interface FishingCollectionDisplayItem {
  name: string;
  source: string;
  environment: string;
  requirement: string;
  unlocked: boolean;
  active: boolean;
}

interface FishingCollectionState {
  unlocked: boolean;
  active?: boolean;
}

interface FishingCatchDisplayItem {
  name: string;
  catches: number;
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

const FISHING_ENVIRONMENTS = ["water", "lava", "ice"] as const;

const FISHING_ENVIRONMENT_NAMES: Record<
  (typeof FISHING_ENVIRONMENTS)[number],
  string
> = {
  water: "Water",
  lava: "Lava",
  ice: "Ice",
};

const prettifyFishingId = (id: string) =>
  id === "N/A" ?
    "N/A" :
    prettify(
      id
        .replace("mainlobby_fishing_", "")
        .replace("fishing_rod_", "")
        .replaceAll("-", "_")
    );

const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;

const formatFishingEnvironment = (environment: string) =>
  `${FISHING_ENVIRONMENT_COLORS[environment.toLowerCase()] ?? "§7"}${prettify(environment)}`;

const collectionItems = <
  T extends {
    id: string;
    source?: string;
    environment?: string;
    requirement?: string;
  }
>(
  data: T[],
  items: FishingCollectionState[]
): FishingCollectionDisplayItem[] =>
  data.map((item, index) => ({
    name: prettifyFishingId(item.id),
    source: item.source ?? "N/A",
    environment: item.environment ? prettify(item.environment) : "N/A",
    requirement: item.requirement ?? "N/A",
    unlocked: items[index]?.unlocked ?? false,
    active: items[index]?.active ?? false,
  }));

const catchItems = (
  category: keyof typeof FISHING_INDIVIDUAL_ITEMS,
  items: FishingIndividualCatch[]
): FishingCatchDisplayItem[] =>
  FISHING_INDIVIDUAL_ITEMS[category].map((item, index) => ({
    name: prettifyFishingId(item.id),
    catches: items[index]?.catches ?? 0,
  }));

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
              {compact ?
                "" :
                ` §7- ${item.source === "N/A" ? item.requirement : item.source}`}
            </text>
            {!compact && item.environment !== "N/A" ?
              (
                <text>§7Found In: {formatFishingEnvironment(item.environment)}</text>
              ) :
              (
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
      {arrayGroup(fishing.mythicals, 3).map((row, rowIndex) => (
        <Table.tr>
          {row.map((mythical, index) => {
            const data = FISHING_MYTHICAL_FISH[rowIndex * 3 + index];
            const percentage =
              fishing.mythical > 0 ? mythical.catches / fishing.mythical : 0;
            const maxed =
              data.maxWeightCap > 0 && mythical.maxWeight >= data.maxWeightCap;

            return (
              <Table.ts title={`§d${data.name}`}>
                <box
                  width="100%"
                  direction="column"
                  padding={{ left: 8, right: 8 }}
                >
                  <Multiline>
                    {[
                      `§7Rarity: §b${data.rarity}`,
                      `§7Catches: §6${t(mythical.catches)}`,
                      `§7Share: §6${formatPercent(percentage)}`,
                      `§7Max Weight: §6${mythical.maxWeight ? `${t(mythical.maxWeight)}kg` : "N/A"}${maxed ? " §aMaxed" : ""}`,
                    ].join("\n")}
                  </Multiline>
                </box>
              </Table.ts>
            );
          })}
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
      items={collectionItems(FISHING_SPECIAL_FISH, fishing.specialFish).slice(
        offset,
        offset + 24
      )}
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
          items={collectionItems(FISHING_RODS, fishing.fishingRods)}
          columns={2}
          compact={false}
        />
      </Table.ts>
      <Table.ts title="§bHook Trails">
        <FishingCollectionTable
          items={collectionItems(
            FISHING_HOOK_TRAILS,
            fishing.hookTrailCollection
          )}
          columns={4}
          compact
        />
      </Table.ts>
    </Table.table>
  );
};

interface CatchSectionProps {
  title: string;
  items: FishingCatchDisplayItem[];
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
        items={catchItems("fish", individual.fish)}
        color="§e"
        columns={3}
        total={fishing.fish}
        t={t}
      />
      <CatchSection
        title="§bPlants"
        items={catchItems("plant", individual.plant)}
        color="§2"
        columns={3}
        total={fishing.plant}
        t={t}
      />
      <CatchSection
        title="§bCreatures"
        items={catchItems("creature", individual.creature)}
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
        items={catchItems("treasure", individual.treasure)}
        color="§a"
        columns={3}
        total={fishing.treasure}
        t={t}
      />
      <CatchSection
        title="§bJunk"
        items={catchItems("junk", individual.junk)}
        color="§c"
        columns={3}
        total={fishing.junk}
        t={t}
      />
    </Table.table>
  );
};

const sumEnvironmentStats = (environments: FishingEnvironmentStats[]) => ({
  fish: environments.reduce((total, environment) => total + environment.fish, 0),
  junk: environments.reduce((total, environment) => total + environment.junk, 0),
  treasure: environments.reduce(
    (total, environment) => total + environment.treasure,
    0
  ),
  plant: environments.reduce(
    (total, environment) => total + environment.plant,
    0
  ),
  creature: environments.reduce(
    (total, environment) => total + environment.creature,
    0
  ),
  mythical: environments.reduce(
    (total, environment) => total + environment.mythical,
    0
  ),
});

interface FishingSeasonalEventDetailsProps {
  event: FishingEvent;
  seasonalYears: FishingSeasonalYear[];
  t: FishingProfileProps["t"];
}

const FishingSeasonalEventDetails = ({
  event,
  seasonalYears,
  t,
}: FishingSeasonalEventDetailsProps) => (
  <Table.ts
    title={`${FISHING_EVENT_COLORS[event]}${FISHING_EVENT_NAMES[event]} Environment Details`}
  >
    {FISHING_ENVIRONMENTS.map((environment) => {
      const stats = sumEnvironmentStats(
        seasonalYears.map((year) => year[event][environment])
      );

      return (
        <Table.tr>
          <Table.td
            title={`${FISHING_ENVIRONMENT_NAMES[environment]} Fish`}
            value={t(stats.fish)}
            color="§e"
          />
          <Table.td
            title={`${FISHING_ENVIRONMENT_NAMES[environment]} Junk`}
            value={t(stats.junk)}
            color="§c"
          />
          <Table.td
            title={`${FISHING_ENVIRONMENT_NAMES[environment]} Treasure`}
            value={t(stats.treasure)}
            color="§a"
          />
          <Table.td
            title={`${FISHING_ENVIRONMENT_NAMES[environment]} Plants`}
            value={t(stats.plant)}
            color="§2"
          />
          <Table.td
            title={`${FISHING_ENVIRONMENT_NAMES[environment]} Creatures`}
            value={t(stats.creature)}
            color="§b"
          />
          <Table.td
            title={`${FISHING_ENVIRONMENT_NAMES[environment]} Mythicals`}
            value={t(stats.mythical)}
            color="§6"
          />
        </Table.tr>
      );
    })}
  </Table.ts>
);

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
      0
    ),
    junk: environments.reduce(
      (total, environment) => total + environment.junk,
      0
    ),
    treasure: environments.reduce(
      (total, environment) => total + environment.treasure,
      0
    ),
    plant: environments.reduce(
      (total, environment) => total + environment.plant,
      0
    ),
    creature: environments.reduce(
      (total, environment) => total + environment.creature,
      0
    ),
    mythical: environments.reduce(
      (total, environment) => total + environment.mythical,
      0
    ),
    water: events.reduce((total, event) => total + event.water.total, 0),
    lava: events.reduce((total, event) => total + event.lava.total, 0),
    ice: events.reduce((total, event) => total + event.ice.total, 0),
    total: year.total,
  };
};

const FishingEnvironments = ({
  t,
  player,
}: Pick<FishingProfileProps, "t" | "player">) => {
  const { fishing } = player.stats.general;

  return (
    <Table.table>
      <Table.ts title="§bEnvironment Details">
        {FISHING_ENVIRONMENTS.map((environment) => {
          const stats = fishing[environment];

          return (
            <Table.tr>
              <Table.td
                title={`${FISHING_ENVIRONMENT_NAMES[environment]} Treasure`}
                value={t(stats.treasure)}
                color="§a"
              />
              <Table.td
                title={`${FISHING_ENVIRONMENT_NAMES[environment]} Plants`}
                value={t(stats.plant)}
                color="§2"
              />
              <Table.td
                title={`${FISHING_ENVIRONMENT_NAMES[environment]} Creatures`}
                value={t(stats.creature)}
                color="§b"
              />
              <Table.td
                title={`${FISHING_ENVIRONMENT_NAMES[environment]} Mythicals`}
                value={t(stats.mythical)}
                color="§6"
              />
            </Table.tr>
          );
        })}
      </Table.ts>
    </Table.table>
  );
};

const FishingSeasonal = ({
  t,
  player,
}: Pick<FishingProfileProps, "t" | "player">) => {
  const { fishing } = player.stats.general;
  const seasonalYears = fishing.seasonal.years.filter((year) => year.total > 0);
  const seasonalEnvironments = seasonalYears.flatMap((year) =>
    FISHING_EVENTS.flatMap((event) =>
      FISHING_ENVIRONMENTS.map((environment) => year[event][environment])
    )
  );
  const seasonal = sumEnvironmentStats(seasonalEnvironments);

  return (
    <Table.table>
      <Table.ts title="§bSeasonal Catch Types">
        <Table.tr>
          <Table.td title="Fish" value={t(seasonal.fish)} color="§e" />
          <Table.td title="Junk" value={t(seasonal.junk)} color="§c" />
          <Table.td title="Treasure" value={t(seasonal.treasure)} color="§a" />
          <Table.td title="Plants" value={t(seasonal.plant)} color="§2" />
          <Table.td title="Creatures" value={t(seasonal.creature)} color="§b" />
        </Table.tr>
      </Table.ts>
      <FishingSeasonalEventDetails
        event="halloween"
        seasonalYears={seasonalYears}
        t={t}
      />
      <FishingSeasonalEventDetails
        event="christmas"
        seasonalYears={seasonalYears}
        t={t}
      />
      <FishingSeasonalEventDetails
        event="easter"
        seasonalYears={seasonalYears}
        t={t}
      />
      <FishingSeasonalEventDetails
        event="summer"
        seasonalYears={seasonalYears}
        t={t}
      />
    </Table.table>
  );
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

const FishingYearly = ({
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
    ["Active Rod", prettifyFishingId(fishing.activeFishingRod), "§a"],
    ["Active Trail", prettifyFishingId(fishing.activeFishHookTrail), "§6"],
  ];

  let title = `§l${FormattedGame.FISHING} §fSeasonal`;

  switch (page) {
    case "overview":
      title = `§l${FormattedGame.FISHING} §fStats`;

      break;

    case "mythicals":
      title = `§l${FormattedGame.FISHING} §fMythicals`;

      break;

    case "specialsOne":
    case "specialsTwo":
      title = `§l${FormattedGame.FISHING} §fSpecial Fish`;

      break;

    case "collections":
      title = `§l${FormattedGame.FISHING} §fCollections`;

      break;

    case "catchesOne":
    case "catchesTwo":
      title = `§l${FormattedGame.FISHING} §fCatches`;

      break;

    case "environments":
      title = `§l${FormattedGame.FISHING} §fEnvironments`;

      break;

    case "yearly":
      title = `§l${FormattedGame.FISHING} §fYearly`;

      break;

  // No default
  }

  let content: JSX.Element;

  switch (page) {
    case "overview":
      content = <FishingOverview t={t} player={player} />;

      break;

    case "mythicals":
      content = <FishingMythicals t={t} player={player} />;

      break;

    case "specialsOne":
    case "specialsTwo":
      content = <FishingSpecials player={player} page={page} />;

      break;

    case "collections":
      content = <FishingCollections player={player} />;

      break;

    case "catchesOne":
      content = <FishingCatchesOne t={t} player={player} />;

      break;

    case "catchesTwo":
      content = <FishingCatchesTwo t={t} player={player} />;

      break;

    case "environments":
      content = <FishingEnvironments t={t} player={player} />;

      break;

    case "seasonal":
      content = <FishingSeasonal t={t} player={player} />;

      break;

    case "yearly":
      content = (
        <FishingYearly
          t={t}
          player={player}
          seasonalYears={seasonalYears}
        />
      );

      break;

  // No default
  }

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
      {content}
      <Footer logo={logo} user={user} />
    </Container>
  );
};
