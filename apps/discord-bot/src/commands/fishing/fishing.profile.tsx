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
  FISHING_CATCH_TYPES,
  FISHING_ENVIRONMENTS,
  FISHING_EVENTS,
  FISHING_HOOK_TRAILS,
  FISHING_ITEMS,
  FISHING_MYTHICAL_FISH,
  FISHING_RODS,
  FISHING_SPECIAL_FISH,
  type Fishing,
  type FishingCatchType,
  type FishingEnvironmentStats,
  type FishingEvent,
  type FishingRod,
  type FishingSeasonalYear,
  FormattedGame,
} from "@statsify/schemas";
import { add, ratio } from "@statsify/math";
import { arrayGroup, prettify } from "@statsify/util";
import type { BaseProfileProps } from "#commands/base.hypixel-command";
import type { LocalizeFunction } from "@statsify/discord";

export const FISHING_PAGES = [
  "overview",
  "mythicals",
  "specialsOne",
  "specialsTwo",
  "collections",
  "catchesOne",
  "catchesTwo",
  "environments",
  "seasonal",
  "yearly",
] as const;

export type FishingPage = (typeof FISHING_PAGES)[number];

const FISHING_PAGE_TITLES = {
  overview: "stats.fishing.overviewTitle",
  mythicals: "stats.fishing.pages.mythicals",
  specialsOne: "stats.fishing.specialFish",
  specialsTwo: "stats.fishing.specialFish",
  collections: "stats.fishing.pages.collections",
  catchesOne: "stats.fishing.catches",
  catchesTwo: "stats.fishing.catches",
  environments: "stats.fishing.pages.environments",
  seasonal: "stats.fishing.pages.seasonal",
  yearly: "stats.fishing.pages.yearly",
} as const satisfies Record<FishingPage, string>;

const CATCH_TYPE_COLORS = {
  fish: "§e",
  junk: "§c",
  treasure: "§a",
  plant: "§2",
  creature: "§b",
  mythical: "§6",
} as const;

const EVENT_COLORS: Record<FishingEvent, string> = {
  halloween: "§5",
  christmas: "§c",
  easter: "§b",
  summer: "§e",
};

const ENVIRONMENT_COLORS = {
  water: "§9",
  lava: "§c",
  ice: "§b",
} as const;

const ENCHANTS = [
  ["luck", "§e"],
  ["lure", "§e"],
  ["mythicalHook", "§d"],
  ["collector", "§a"],
  ["dumpsterDiver", "§7"],
  ["vulcansBlessing", "§c"],
  ["neptunesFury", "§b"],
  ["herbivore", "§2"],
] as const satisfies [keyof Fishing["enchants"], string][];

const rodName = (id: string) => prettify(id.replace("fishing_rod_", ""));

// Everyone has the default rod, so the schema doesn't store it
const isRodUnlocked = (fishing: Fishing, id: FishingRod) => id === "fishing_rod_3000" || fishing.rods[id];
const hookTrailName = (id: string) => prettify(id.replace("mainlobby_fishing_", ""));

interface FishingProfileProps extends BaseProfileProps {
  page: FishingPage;
  pageNumber: number;
  pageCount: number;
  seasonalYears: FishingSeasonalYear[];
}

interface PageProps {
  t: LocalizeFunction;
  fishing: Fishing;
  seasonalYears: FishingSeasonalYear[];
}

interface CollectionItem {
  name: string;
  unlocked: boolean;
  active?: boolean;
  source?: string;
  detail?: string;
}

const CollectionTable = ({ t, items, columns }: { t: LocalizeFunction; items: CollectionItem[]; columns: number }) => (
  <Table.table>
    {arrayGroup(items, columns).map((row) => (
      <Table.tr>
        {row.map((item) => {
          const color = item.unlocked ? "§a" : "§c";
          const status = t(item.unlocked ? "stats.fishing.unlocked" : "stats.fishing.locked");

          return (
            <box width="100%" direction="column" padding={{ left: 8, right: 8, top: 4, bottom: 4 }}>
              <text>
                §l{color}
                {item.active ? "§n" : ""}
                {item.name}
              </text>
              <text>
                {color}
                {status}
                {item.source ? ` §7- ${item.source}` : ""}
              </text>
              {item.detail ? <text>{item.detail}</text> : <></>}
            </box>
          );
        })}
      </Table.tr>
    ))}
  </Table.table>
);

const eventStats = (years: FishingSeasonalYear[], events: readonly FishingEvent[]) =>
  years.flatMap((year) => events.flatMap((event) => FISHING_ENVIRONMENTS.map((environment) => year[event][environment])));

const Overview = ({ t, fishing }: PageProps) => (
  <Table.table>
    <Table.ts title={`§b${t("stats.fishing.lifetimeCatches")}`}>
      {arrayGroup([...FISHING_CATCH_TYPES, "mythical" as const], 3).map((types) => (
        <Table.tr>
          {types.map((type) => (
            <Table.td
              title={t(`stats.fishing.catchTypes.${type}`)}
              value={t(fishing[type])}
              color={CATCH_TYPE_COLORS[type]}
            />
          ))}
        </Table.tr>
      ))}
    </Table.ts>
    <Table.ts title={`§b${t("stats.fishing.environmentBreakdown")}`}>
      {FISHING_ENVIRONMENTS.map((environment) => {
        const name = t(`stats.fishing.environments.${environment}`);
        const stats = fishing[environment];

        return (
          <Table.tr>
            <Table.td
              title={`${name} ${t("stats.fishing.catchTypes.fish")}`}
              value={t(stats.fish)}
              color={CATCH_TYPE_COLORS.fish}
            />
            <Table.td
              title={`${name} ${t("stats.fishing.catchTypes.junk")}`}
              value={t(stats.junk)}
              color={CATCH_TYPE_COLORS.junk}
            />
            <Table.td
              title={`${name} ${t("stats.total")}`}
              value={t(stats.total)}
              color={ENVIRONMENT_COLORS[environment]}
            />
          </Table.tr>
        );
      })}
    </Table.ts>
    <Table.ts title={`§b${t("stats.fishing.rodPerks")}`}>
      {arrayGroup([...ENCHANTS], 3).map((row) => (
        <Table.tr>
          {row.map(([enchant, color]) => (
            <Table.td title={t(`stats.fishing.enchants.${enchant}`)} value={t(fishing.enchants[enchant])} color={color} />
          ))}
        </Table.tr>
      ))}
    </Table.ts>
    <Table.ts title={`§b${t("stats.fishing.fireproofing.title")}`}>
      <Table.tr>
        <Table.td title={t("stats.fishing.fireproofing.scales")} value={t(fishing.fireproofing.scales)} color="§e" />
        <Table.td title={t("stats.fishing.fireproofing.sealant")} value={t(fishing.fireproofing.sealant)} color="§a" />
        <Table.td title={t("stats.fishing.fireproofing.flame")} value={t(fishing.fireproofing.flame)} color="§c" />
      </Table.tr>
    </Table.ts>
  </Table.table>
);

const Mythicals = ({ t, fishing }: PageProps) => (
  <Table.table>
    {arrayGroup([...FISHING_MYTHICAL_FISH], 3).map((row) => (
      <Table.tr>
        {row.map((mythical) => {
          const catches = fishing.mythicals[mythical.id];
          const weight = fishing.mythicalWeights[mythical.id];
          const maxed = "maxWeight" in mythical && weight >= mythical.maxWeight;

          return (
            <Table.ts title={`§d${mythical.name}`}>
              <box width="100%" direction="column" padding={{ left: 8, right: 8 }}>
                <Multiline>
                  {[
                    `§7${t("stats.fishing.rarity")}: §b${t(`stats.fishing.rarities.${mythical.rarity}`)}`,
                    `§7${t("stats.fishing.catches")}: §6${t(catches)}`,
                    `§7${t("stats.fishing.share")}: §6${t(ratio(catches, fishing.mythical, 100))}%`,
                    ...(weight ?
                      [`§7${t("stats.fishing.maxWeight")}: §6${t(weight)}kg${maxed ? ` §a${t("stats.fishing.maxed")}` : ""}`] :
                      []),
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

const Specials = ({ t, fishing, specialFish }: PageProps & { specialFish: (typeof FISHING_SPECIAL_FISH)[number][] }) => {
  const items = specialFish.map((fish) => ({
    name: prettify(fish.id),
    unlocked: fishing.specialFish[fish.id],
    source: t(`stats.fishing.sources.${fish.source}`),
    detail: `§7${t("stats.fishing.foundIn")}: ${ENVIRONMENT_COLORS[fish.environment]}${t(`stats.fishing.environments.${fish.environment}`)}`,
  }));

  return <CollectionTable t={t} items={items} columns={3} />;
};

const Collections = ({ t, fishing }: PageProps) => (
  <Table.table>
    <Table.ts title={`§b${t("stats.fishing.fishingRods")}`}>
      <CollectionTable
        t={t}
        columns={2}
        items={FISHING_RODS.map((id) => ({
          name: rodName(id),
          unlocked: isRodUnlocked(fishing, id),
          active: fishing.activeRod === id,
          detail: `§7${t(`stats.fishing.rodRequirements.${id}`)}`,
        }))}
      />
    </Table.ts>
    <Table.ts title={`§b${t("stats.fishing.hookTrails")}`}>
      <CollectionTable
        t={t}
        columns={4}
        items={FISHING_HOOK_TRAILS.map((id) => ({
          name: hookTrailName(id),
          unlocked: fishing.hookTrails[id],
          active: fishing.activeHookTrail === id,
        }))}
      />
    </Table.ts>
  </Table.table>
);

const CatchSection = ({ t, fishing, type }: { t: LocalizeFunction; fishing: Fishing; type: FishingCatchType }) => {
  const catches: Record<string, number> = fishing.catches[type];
  const color = CATCH_TYPE_COLORS[type];

  return (
    <Table.ts title={`§b${t(`stats.fishing.catchTypes.${type}`)} §7- ${color}${t(fishing[type])}`}>
      {arrayGroup([...FISHING_ITEMS[type]], 3).map((row) => (
        <Table.tr>
          {row.map((id) => (
            <Table.td title={prettify(id)} value={t(catches[id])} color={color} size="inline" />
          ))}
        </Table.tr>
      ))}
    </Table.ts>
  );
};

const Catches = ({ t, fishing, types }: PageProps & { types: FishingCatchType[] }) => (
  <Table.table>
    {types.map((type) => (
      <CatchSection t={t} fishing={fishing} type={type} />
    ))}
  </Table.table>
);

const Environments = ({ t, fishing }: PageProps) => (
  <Table.table>
    <Table.ts title={`§b${t("stats.fishing.environmentDetails")}`}>
      {FISHING_ENVIRONMENTS.map((environment) => {
        const name = t(`stats.fishing.environments.${environment}`);

        return (
          <Table.tr>
            {(["treasure", "plant", "creature"] as const).map((type) => (
              <Table.td
                title={`${name} ${t(`stats.fishing.catchTypes.${type}`)}`}
                value={t(fishing[environment][type])}
                color={CATCH_TYPE_COLORS[type]}
              />
            ))}
          </Table.tr>
        );
      })}
    </Table.ts>
  </Table.table>
);

const CatchTypeRow = ({ t, stats, types }: { t: LocalizeFunction; stats: FishingEnvironmentStats[]; types: readonly (keyof typeof CATCH_TYPE_COLORS)[] }) => (
  <Table.tr>
    {types.map((type) => (
      <Table.td title={t(`stats.fishing.catchTypes.${type}`)} value={t(add(...stats.map((environment) => environment[type])))} color={CATCH_TYPE_COLORS[type]} />
    ))}
  </Table.tr>
);

const Seasonal = ({ t, fishing }: PageProps) => (
  <Table.table>
    {[
      <Table.ts title={`§b${t("stats.fishing.seasonalCatchTypes")}`}>
        <CatchTypeRow t={t} stats={eventStats(fishing.seasonal, FISHING_EVENTS)} types={FISHING_CATCH_TYPES} />
      </Table.ts>,
      ...arrayGroup([...FISHING_EVENTS], 2).map((events) => (
        <Table.tr>
          {events.map((event) => {
            const stats = eventStats(fishing.seasonal, [event]);
            const total = add(...fishing.seasonal.map((year) => year[event].total));

            return (
              <Table.ts title={`${EVENT_COLORS[event]}${t(`stats.fishing.events.${event}`)} §7- §f${t(total)}`}>
                <CatchTypeRow t={t} stats={stats} types={["fish", "junk", "treasure"]} />
                <CatchTypeRow t={t} stats={stats} types={["plant", "creature", "mythical"]} />
              </Table.ts>
            );
          })}
        </Table.tr>
      )),
    ]}
  </Table.table>
);

const Yearly = ({ t, fishing, seasonalYears }: PageProps) => {
  const total = add(...fishing.seasonal.map((year) => year.total));

  return (
    <Table.table>
      {[
        <Table.ts title={`§b${t("stats.fishing.allTimeSeasonal")} §7- §f${t(total)}`}>
          <Table.tr>
            {FISHING_EVENTS.map((event) => (
              <Table.td
                title={t(`stats.fishing.events.${event}`)}
                value={t(add(...fishing.seasonal.map((year) => year[event].total)))}
                color={EVENT_COLORS[event]}
              />
            ))}
          </Table.tr>
        </Table.ts>,
        ...seasonalYears.map((year) => (
          <Table.ts title={`§b§l${year.year} §r§7- §f${t(year.total)}`}>
            <Table.tr>
              {FISHING_EVENTS.map((event) => (
                <Table.td title={t(`stats.fishing.events.${event}`)} value={t(year[event].total)} color={EVENT_COLORS[event]} />
              ))}
            </Table.tr>
            <Table.tr>
              {[
                ...FISHING_ENVIRONMENTS.map((environment) => (
                  <Table.td
                    title={t(`stats.fishing.environments.${environment}`)}
                    value={t(add(...FISHING_EVENTS.map((event) => year[event][environment].total)))}
                    color={ENVIRONMENT_COLORS[environment]}
                  />
                )),
                <Table.td
                  title={t("stats.fishing.catchTypes.mythical")}
                  value={t(add(...eventStats([year], FISHING_EVENTS).map((environment) => environment.mythical)))}
                  color={CATCH_TYPE_COLORS.mythical}
                />,
              ]}
            </Table.tr>
          </Table.ts>
        )),
      ]}
    </Table.table>
  );
};

const PAGE_CONTENT: Record<FishingPage, (props: PageProps) => JSX.Element> = {
  overview: Overview,
  mythicals: Mythicals,
  specialsOne: (props) => <Specials {...props} specialFish={FISHING_SPECIAL_FISH.slice(0, 24)} />,
  specialsTwo: (props) => <Specials {...props} specialFish={FISHING_SPECIAL_FISH.slice(24)} />,
  collections: Collections,
  catchesOne: (props) => <Catches {...props} types={["fish", "plant", "creature"]} />,
  catchesTwo: (props) => <Catches {...props} types={["treasure", "junk"]} />,
  environments: Environments,
  seasonal: Seasonal,
  yearly: Yearly,
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
  const unlockedRods = FISHING_RODS.filter((id) => isRodUnlocked(fishing, id)).length;
  const unlockedHookTrails = FISHING_HOOK_TRAILS.filter((id) => fishing.hookTrails[id]).length;

  const sidebar: SidebarItem[] = [
    [t("stats.fishing.totalCatches"), t(fishing.totalCatches), "§b"],
    [t("stats.fishing.catchTypes.mythical"), t(fishing.mythical), "§6"],
    [t("stats.fishing.specialFish"), `${t(fishing.special)}/${t(FISHING_SPECIAL_FISH.length)}`, "§d"],
    [t("stats.fishing.rods"), `${t(unlockedRods)}/${t(FISHING_RODS.length)}`, "§a"],
    [t("stats.fishing.hookTrails"), `${t(unlockedHookTrails)}/${t(FISHING_HOOK_TRAILS.length)}`, "§6"],
  ];

  if (fishing.activeRod) sidebar.push([t("stats.fishing.activeRod"), rodName(fishing.activeRod), "§a"]);
  if (fishing.activeHookTrail) sidebar.push([t("stats.fishing.activeTrail"), hookTrailName(fishing.activeHookTrail), "§6"]);

  const Content = PAGE_CONTENT[page];

  return (
    <Container background={background}>
      <Header
        skin={skin}
        name={player.prefixName}
        badge={badge}
        sidebar={sidebar}
        title={`§l${FormattedGame.FISHING} §f${t(FISHING_PAGE_TITLES[page])}`}
        description={`§7${t("stats.fishing.page", { page: t(pageNumber + 1), pages: t(pageCount) })}`}
        time={time}
      />
      <Content t={t} fishing={fishing} seasonalYears={seasonalYears} />
      <Footer logo={logo} user={user} />
    </Container>
  );
};
