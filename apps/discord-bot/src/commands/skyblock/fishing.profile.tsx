/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Container, Footer, Header, type SidebarItem, Table } from "#components";
import { Empty } from "./components/Empty.js";
import { MEDAL_COLORS, TROPHY_TIERS } from "@statsify/skyblock/display";
import { gridRows } from "./components/ItemGrid.js";
import { prettify } from "@statsify/util";
import type { FishingSection } from "@statsify/skyblock";
import type { LocalizeFunction } from "@statsify/discord";
import type { SkyBlockProfileProps } from "./skyblock.command.js";

const CATCHES = ["normal", "treasure", "largeTreasure", "outstanding"] as const;

const SEA_CREATURES_SHOWN = 24;

export interface SkyBlockFishingProfileProps extends SkyBlockProfileProps {
  page: "trophyFish" | "seaCreatures";
}

export const SkyBlockFishingProfile = ({
  profile,
  title,
  skin,
  badge,
  background,
  logo,
  user,
  t,
  page,
}: SkyBlockFishingProfileProps) => {
  const fishing = profile.member.fishing;

  if (!fishing) {
    return (
      <Container background={background}>
        <Header skin={skin} name={profile.displayName} badge={badge} title={title} time="LIVE" />
        <Empty text={t("skyblock.noFishing")} />
        <Footer logo={logo} user={user} />
      </Container>
    );
  }

  const sidebar: SidebarItem[] = [
    [t("skyblock.itemsFished"), t(fishing.itemsFished.total), "§b"],
    [t("skyblock.trophyFishCaught"), t(fishing.trophyFishCaught), "§6"],
    [t("skyblock.seaCreatureKills"), t(fishing.seaCreatureKills), "§3"],
  ];

  return (
    <Container background={background}>
      <Header skin={skin} name={profile.displayName} badge={badge} sidebar={sidebar} title={title} time="LIVE" />
      {page === "trophyFish" ? <TrophyFishTable fishing={fishing} t={t} /> : <SeaCreatureTable fishing={fishing} t={t} />}
      <Footer logo={logo} user={user} />
    </Container>
  );
};

interface FishingTableProps {
  fishing: FishingSection;
  t: LocalizeFunction;
}

const Cell = ({ name, value }: { name: string; value: string }) => (
  <box width="100%" padding={{ left: 8, right: 8, top: 4, bottom: 4 }}>
    <text>{name}</text>
    <div width="remaining" margin={{ left: 4, right: 4 }} />
    <text>{value}</text>
  </box>
);

const TrophyFishTable = ({ fishing, t }: FishingTableProps) => {
  const fish = fishing.trophyFish.map(({ name, tiers }) => (
    <Cell
      name={`${TROPHY_TIERS.some((tier) => tiers[tier] > 0) ? "§f" : "§8"}${name}`}
      value={TROPHY_TIERS.map((tier) => `${MEDAL_COLORS[tier]}${t(tiers[tier])}`).join(" §8• ")}
    />
  ));

  const legend = TROPHY_TIERS.map((tier) => `${MEDAL_COLORS[tier]}${prettify(tier)}`).join(" §8• ");

  return (
    <Table.table>
      <Table.ts title={`§b${t("skyblock.itemsFished")}`}>
        <Table.tr>
          {CATCHES.map((kind) => (
            <Table.td title={t(`skyblock.catches.${kind}`)} value={t(fishing.itemsFished[kind])} color="§b" size="small" />
          ))}
        </Table.tr>
      </Table.ts>
      <Table.ts title={`§6${t("skyblock.trophyFish")} §8(${legend}§8)`}>
        {gridRows(fish, 2)}
      </Table.ts>
    </Table.table>
  );
};

const SeaCreatureTable = ({ fishing, t }: FishingTableProps) => {
  const creatures = fishing.seaCreatures.slice(0, SEA_CREATURES_SHOWN).map(({ name, kills }) => (
    <Cell name={`§3${name}`} value={`§f${t(kills)}`} />
  ));

  if (creatures.length === 0) return <Empty text={t("skyblock.noSeaCreatures")} />;

  return <Table.table>{gridRows(creatures, 3)}</Table.table>;
};
