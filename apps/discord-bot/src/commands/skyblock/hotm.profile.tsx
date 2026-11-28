/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Card } from "./components/Card.js";
import { PerkCurrency, PerkTree } from "./components/PerkTree.js";
import { type SidebarItem, Table } from "#components";
import { LevelBar } from "./components/LevelBar.js";
import { POWDERS, POWDER_COLORS } from "@statsify/skyblock/display";
import { prettify } from "@statsify/util";
import type { SkyBlockProfileProps } from "./skyblock.command.js";

export const SkyBlockHotmProfile = ({
  profile,
  t,
  ...card
}: SkyBlockProfileProps) => {
  const {
    level,
    coreLevel,
    loadout,
    tokens,
    ability,
    powder,
    nodes,
    crystals,
    nucleusRuns,
    glacite,
  } = profile.member.hotm!;

  const sidebar: SidebarItem[] = [
    [
      t("skyblock.tokensSpent"),
      `${t(tokens.spent)}§7/§5${t(tokens.total)}`,
      "§5",
    ],
    [t("skyblock.coreOfTheMountain"), t(coreLevel), "§6"],
    [
      t("skyblock.pickaxeAbility"),
      ability ? prettify(ability) : t("skyblock.none"),
      "§e",
    ],
  ];

  if (loadout.total > 1)
    sidebar.unshift([
      t("skyblock.loadout"),
      t("skyblock.loadoutOf", loadout),
      "§b",
    ]);

  if (profile.player)
    sidebar.push([
      t("skyblock.lifetimeCommissions"),
      t(profile.player.commissions),
      "§2",
    ]);

  const powders = POWDERS.map((type) => (
    <PerkCurrency
      name={t(`skyblock.powders.${type}`)}
      color={POWDER_COLORS[type]}
      earned={powder[type].total}
      spent={powder[type].spent}
      t={t}
    />
  ));

  const stats: [string, string, string][] = [
    [t("skyblock.crystalsFound"), t(crystals.found), "§d"],
    [t("skyblock.crystalsPlaced"), t(crystals.placed), "§d"],
    [t("skyblock.nucleusRuns"), t(nucleusRuns), "§5"],
    [t("skyblock.corpsesLooted"), t(glacite.corpses), "§b"],
    [
      t("skyblock.fossilsDonated"),
      `${t(glacite.fossils)}§7/§6${t(glacite.maxFossils)}`,
      "§6",
    ],
    [t("skyblock.mineshafts"), t(glacite.mineshafts), "§3"],
  ];

  return (
    <Card {...card} name={profile.displayName} sidebar={sidebar}>
      <Table.table>
        <Table.tr>
          <LevelBar
            title={t("skyblock.hotmLevel")}
            level={level}
            color="§5"
            t={t}
          />
        </Table.tr>
        <Table.tr>{powders}</Table.tr>
        {/* A Table.tr won't stretch the stats' box to the tree's height. */}
        <div width="100%">
          <box direction="column" width="1/2" location="center">
            <text
              margin={{ top: 8, bottom: 4, left: 6, right: 6 }}
            >{`§5${t("skyblock.perkTree")}`}</text>
            <PerkTree nodes={nodes} />
          </box>
          <box
            direction="column"
            width="1/2"
            height="remaining"
            location="center"
          >
            {stats.map(([name, value, color]) => (
              <text
                margin={{ top: 2, bottom: 2, left: 10, right: 10 }}
              >{`§7${name}: ${color}${value}`}</text>
            ))}
          </box>
        </div>
      </Table.table>
    </Card>
  );
};
