/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Container, Footer, Header, type SidebarItem, Table } from "#components";
import { LevelBar } from "./components/LevelBar.js";
import { POWDERS, POWDER_COLORS } from "@statsify/skyblock/display";
import { PerkCurrency, PerkTree } from "./components/PerkTree.js";
import { prettify } from "@statsify/util";
import type { SkyBlockProfileProps } from "./skyblock.command.js";

export const SkyBlockHotmProfile = ({
  profile,
  title,
  skin,
  badge,
  background,
  logo,
  user,
  t,
}: SkyBlockProfileProps) => {
  const { level, coreLevel, loadout, tokens, ability, powder, nodes, crystals, nucleusRuns, glacite } =
    profile.member.hotm!;

  const sidebar: SidebarItem[] = [
    [t("skyblock.tokensSpent"), `${t(tokens.spent)}§7/§5${t(tokens.total)}`, "§5"],
    [t("skyblock.coreOfTheMountain"), t(coreLevel), "§6"],
    [t("skyblock.pickaxeAbility"), ability ? prettify(ability) : t("skyblock.none"), "§e"],
  ];

  if (loadout.total > 1) sidebar.unshift([t("skyblock.loadout"), t("skyblock.loadoutOf", loadout), "§b"]);

  const powders = POWDERS.map((type) => (
    <PerkCurrency
      name={t(`skyblock.powders.${type}`)}
      color={POWDER_COLORS[type]}
      amount={powder[type].available}
      spent={powder[type].spent}
      t={t}
    />
  ));

  const stats: [string, number, string][] = [
    [t("skyblock.crystalsFound"), crystals.found, "§d"],
    [t("skyblock.crystalsPlaced"), crystals.placed, "§d"],
    [t("skyblock.nucleusRuns"), nucleusRuns, "§5"],
    [t("skyblock.corpsesLooted"), glacite.corpses, "§b"],
    [t("skyblock.fossilsDonated"), glacite.fossils, "§6"],
    [t("skyblock.mineshafts"), glacite.mineshafts, "§3"],
  ];

  return (
    <Container background={background}>
      <Header skin={skin} name={profile.displayName} badge={badge} sidebar={sidebar} title={title} time="LIVE" />
      <Table.table>
        <Table.tr>
          <LevelBar title={t("skyblock.hotmLevel")} level={level} color="§5" t={t} />
        </Table.tr>
        <Table.tr>{powders}</Table.tr>
        <Table.tr>
          <box width="100%" location="center">
            <PerkTree nodes={nodes} />
          </box>
          <box direction="column" location="center" width="100%">
            {stats.map(([name, value, color]) => (
              <text margin={{ top: 2, bottom: 2, left: 10, right: 10 }}>{`§7${name}: ${color}${t(value)}`}</text>
            ))}
          </box>
        </Table.tr>
      </Table.table>
      <Footer logo={logo} user={user} />
    </Container>
  );
};
