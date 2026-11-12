/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Container, Footer, Header, type SidebarItem, Table } from "#components";
import { Empty } from "./components/Empty.js";
import { INVENTORIES, RARITY_COLORS, formatProfileName } from "@statsify/skyblock/display";
import { ItemGrid, gridRows, pricesAsOf } from "./components/ItemGrid.js";
import { add } from "@statsify/math";
import { removeFormatting } from "@statsify/util";
import type { Image } from "skia-canvas";
import type { LocalizeFunction } from "@statsify/discord";
import type { MemberView, ProfileSummary } from "@statsify/skyblock";
import type { PostSkyBlockRankingsResponse } from "@statsify/api-client";
import type { SkyBlockProfileProps } from "./skyblock.command.js";
import type { User } from "@statsify/schemas";

const MISSING_PETS = 12;
const RANKS = 16;

const boardName = (name: string) => removeFormatting(name).replace(/^SkyBlock /, "");

export const missingPetIcons = ({ values }: MemberView) => values?.missingPets.slice(0, MISSING_PETS).map(({ texture }) => texture) ?? [];

export const SkyBlockValuesProfile = ({
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
  const values = profile.member.values!;
  const totals = values.inventories?.totals ?? {};
  const sacks = add(...Object.values(values.inventories?.sacks ?? {}));

  const sidebar: SidebarItem[] = [
    [t("skyblock.inventoriesWorth"), t(Math.floor(add(...Object.values(totals), sacks))), "§6"],
    [t("skyblock.missingPets"), t(values.missingPets.length), "§d"],
  ];

  const cells = [
    ...INVENTORIES.flatMap((id) => {
      const total = totals[id];
      return total ? [<Table.td title={t(`skyblock.inventories.${id}`)} value={t(Math.floor(total))} color="§6" size="small" />] : [];
    }),
    ...(sacks > 0 ? [<Table.td title={t("skyblock.inventories.sacks")} value={t(Math.floor(sacks))} color="§6" size="small" />] : []),
  ];

  return (
    <Container background={background}>
      <Header skin={skin} name={profile.displayName} badge={badge} sidebar={sidebar} title={title} time="LIVE" />
      {cells.length > 0 ? <Table.table>{gridRows(cells, 4, true)}</Table.table> : <></>}
      {values.missingPets.length > 0 ?
        (
          <ItemGrid
            items={values.missingPets.slice(0, MISSING_PETS).map(({ texture, name, rarity, price, points }) => ({
              texture,
              name: `${RARITY_COLORS[rarity]}${name} §7+${t(points)}`,
              value: `§6${t(Math.floor(price))}`,
            }))}
            icons={icons}
            columns={3}
            stacked
            spreadLastRow
          />
        ) :
        <Empty text={t("skyblock.noMissingPets")} />}
      <box width="100%">
        <text>{`§7${pricesAsOf(t, values.pricesAsOf)}`}</text>
      </box>
      <Footer logo={logo} user={user} />
    </Container>
  );
};

export interface SkyBlockRanksProfileProps {
  rankings: PostSkyBlockRankingsResponse[];
  profiles: ProfileSummary[];
  displayName: string;
  skin: Image;
  badge?: Image;
  background: Image;
  logo: Image;
  user: User | null;
  t: LocalizeFunction;
  title: string;
}

export const SkyBlockRanksProfile = ({
  rankings,
  profiles,
  displayName,
  skin,
  badge,
  background,
  logo,
  user,
  t,
  title,
}: SkyBlockRanksProfileProps) => {
  const profileNames = new Map(profiles.map((profile) => [profile.id, formatProfileName(profile)]));

  // A row on a profile the player has since left lingers until the boards next drop it
  const cells = rankings
    .flatMap(({ name, rank, value, id }) => {
      const profileName = profileNames.get(id.split(":")[1]);
      if (!profileName) return [];

      const shown = typeof value === "number" ? t(value) : value;
      return [
        <Table.td
          title={`§f${boardName(name)}`}
          value={`§e#${t(rank)} §7${shown} §7(${profileName}§7)`}
          color="§f"
          size="small"
        />,
      ];
    })
    .slice(0, RANKS);

  return (
    <Container background={background}>
      <Header skin={skin} name={displayName} badge={badge} title={title} time="LIVE" />
      {cells.length > 0 ? <Table.table>{gridRows(cells, 2)}</Table.table> : <Empty text={t("skyblock.noRanks")} />}
      <Footer logo={logo} user={user} />
    </Container>
  );
};
